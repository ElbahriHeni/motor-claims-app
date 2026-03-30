require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/motorclaims',
    ssl: process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : false,
});

function generateReferenceNumber() {
    return 'CLM-' + Math.random().toString(36).substring(2, 11).toUpperCase();
}

async function getDefaultRequestorUserId(client) {
    const result = await client.query(
        `SELECT id FROM app_users
         WHERE role = 'REQUESTOR'
         ORDER BY id ASC
         LIMIT 1`
    );

    return result.rows[0]?.id || null;
}

async function getRegionIdByCode(client, regionCode) {
    if (!regionCode) {
        return null;
    }

    const result = await client.query(
        `SELECT id FROM regions
         WHERE code = $1 AND is_active = TRUE
         LIMIT 1`,
        [regionCode]
    );

    return result.rows[0]?.id || null;
}

async function createFinanceTask(client, claimId, regionId, createdBy) {
    const taskResult = await client.query(
        `INSERT INTO finance_tasks (claim_id, region_id, created_by, status)
         VALUES ($1, $2, $3, 'PENDING')
         RETURNING *`,
        [claimId, regionId, createdBy]
    );

    const task = taskResult.rows[0];

    await client.query(
        `INSERT INTO finance_task_history (finance_task_id, action, action_by, comment)
         VALUES ($1, $2, $3, $4)`,
        [task.id, 'CREATED', createdBy, 'Finance task created on claim submission']
    );

    return task;
}

async function getRegionByCode(client, regionCode) {
    const result = await client.query(
        `SELECT * FROM regions
         WHERE code = $1 AND is_active = TRUE
         LIMIT 1`,
        [regionCode]
    );

    return result.rows[0] || null;
}

async function getFinanceTaskDetails(taskId) {
    const taskResult = await pool.query(
        `SELECT
            ft.*,
            r.code AS region_code,
            r.name AS region_name,
            au.full_name AS assigned_user_name,
            au.email AS assigned_user_email,
            cb.full_name AS created_by_name,
            cb.email AS created_by_email
         FROM finance_tasks ft
         JOIN regions r ON r.id = ft.region_id
         LEFT JOIN app_users au ON au.id = ft.assigned_user_id
         LEFT JOIN app_users cb ON cb.id = ft.created_by
         WHERE ft.id = $1`,
        [taskId]
    );

    if (taskResult.rows.length === 0) {
        return null;
    }

    const task = taskResult.rows[0];
    const claimId = task.claim_id;

    const claimResult = await pool.query(
        'SELECT * FROM claims WHERE id = $1',
        [claimId]
    );

    const detailsResult = await pool.query(
        'SELECT * FROM claim_details WHERE claim_id = $1',
        [claimId]
    );

    const vehicleResult = await pool.query(
        'SELECT * FROM vehicle_info WHERE claim_id = $1',
        [claimId]
    );

    const documentsResult = await pool.query(
        'SELECT * FROM documents WHERE claim_id = $1 ORDER BY id DESC',
        [claimId]
    );

    const historyResult = await pool.query(
        `SELECT
            h.*,
            u.full_name AS action_by_name,
            u.email AS action_by_email
         FROM finance_task_history h
         LEFT JOIN app_users u ON u.id = h.action_by
         WHERE h.finance_task_id = $1
         ORDER BY h.id ASC`,
        [taskId]
    );

    return {
        task,
        claim: claimResult.rows[0] || null,
        details: detailsResult.rows[0] || null,
        vehicle: vehicleResult.rows[0] || null,
        documents: documentsResult.rows,
        history: historyResult.rows,
    };
}

async function getOpenFinanceTaskForUpdate(client, taskId) {
    const result = await client.query(
        `SELECT * FROM finance_tasks
         WHERE id = $1
         FOR UPDATE`,
        [taskId]
    );

    return result.rows[0] || null;
}

// Test route
app.get('/', (req, res) => {
    res.send('Motor Claims API running');
});

// Get claims
app.get('/claims', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM claims ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Create new claim
app.post('/claims', async (req, res) => {
    try {
        const referenceNumber = generateReferenceNumber();

        const result = await pool.query(
            'INSERT INTO claims (reference_number, status) VALUES ($1, $2) RETURNING *',
            [referenceNumber, 'DRAFT']
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating claim');
    }
});

// Save claim details
app.put('/claims/:id/details', async (req, res) => {
    const { id } = req.params;
    const {
        fullName,
        email,
        phone,
        policyNumber,
        incidentDate,
        incidentTime,
        location,
        claimType,
        description,
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO claim_details
            (claim_id, full_name, email, phone, policy_number, incident_date, incident_time, location, claim_type, description)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            ON CONFLICT (claim_id)
            DO UPDATE SET
                full_name = EXCLUDED.full_name,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                policy_number = EXCLUDED.policy_number,
                incident_date = EXCLUDED.incident_date,
                incident_time = EXCLUDED.incident_time,
                location = EXCLUDED.location,
                claim_type = EXCLUDED.claim_type,
                description = EXCLUDED.description
            RETURNING *`,
            [
                id,
                fullName || null,
                email || null,
                phone || null,
                policyNumber || null,
                incidentDate || null,
                incidentTime || null,
                location || null,
                claimType || null,
                description || null,
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving claim details');
    }
});

// Save vehicle info
app.put('/claims/:id/vehicle', async (req, res) => {
    const { id } = req.params;
    const {
        vehicleMake,
        vehicleModel,
        vehicleYear,
        licensePlate,
        vinNumber,
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO vehicle_info
            (claim_id, vehicle_make, vehicle_model, vehicle_year, license_plate, vin_number)
            VALUES ($1,$2,$3,$4,$5,$6)
            ON CONFLICT (claim_id)
            DO UPDATE SET
                vehicle_make = EXCLUDED.vehicle_make,
                vehicle_model = EXCLUDED.vehicle_model,
                vehicle_year = EXCLUDED.vehicle_year,
                license_plate = EXCLUDED.license_plate,
                vin_number = EXCLUDED.vin_number
            RETURNING *`,
            [
                id,
                vehicleMake || null,
                vehicleModel || null,
                vehicleYear || null,
                licensePlate || null,
                vinNumber || null,
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving vehicle info');
    }
});

// Save document metadata
app.put('/claims/:id/documents', async (req, res) => {
    const { id } = req.params;
    const { photos = [], documents = [] } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query('DELETE FROM documents WHERE claim_id = $1', [id]);

        for (const photoName of photos) {
            await client.query(
                `INSERT INTO documents (claim_id, file_name, file_path, file_type, category)
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, photoName, photoName, 'image', 'damage_photo']
            );
        }

        for (const documentName of documents) {
            await client.query(
                `INSERT INTO documents (claim_id, file_name, file_path, file_type, category)
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, documentName, documentName, 'document', 'supporting_document']
            );
        }

        await client.query('COMMIT');

        const result = await pool.query(
            'SELECT * FROM documents WHERE claim_id = $1 ORDER BY id DESC',
            [id]
        );

        res.json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error saving documents');
    } finally {
        client.release();
    }
});

// Submit claim and create finance task
app.put('/claims/:id/submit', async (req, res) => {
    const { id } = req.params;
    const { regionCode = 'RUH' } = req.body || {};

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const claimCheck = await client.query(
            'SELECT * FROM claims WHERE id = $1 FOR UPDATE',
            [id]
        );

        if (claimCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).send('Claim not found');
        }

        const existingPendingTask = await client.query(
            `SELECT id
             FROM finance_tasks
             WHERE claim_id = $1
               AND status IN ('PENDING', 'ASSIGNED')
             LIMIT 1`,
            [id]
        );

        if (existingPendingTask.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'A finance task already exists for this claim',
                financeTaskId: existingPendingTask.rows[0].id,
            });
        }

        const regionId = await getRegionIdByCode(client, regionCode);
        if (!regionId) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Invalid or inactive region code' });
        }

        const submittedBy = await getDefaultRequestorUserId(client);

        const claimResult = await client.query(
            `UPDATE claims
             SET status = $1,
                 region_id = $2,
                 submitted_by = COALESCE(submitted_by, $3)
             WHERE id = $4
             RETURNING *`,
            ['SUBMITTED', regionId, submittedBy, id]
        );

        const claim = claimResult.rows[0];
        const financeTask = await createFinanceTask(client, claim.id, regionId, submittedBy);

        await client.query('COMMIT');

        res.json({
            ...claim,
            financeTask,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error submitting claim');
    } finally {
        client.release();
    }
});

// Get one claim by id
app.get('/claims/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const claimResult = await pool.query(
            'SELECT * FROM claims WHERE id = $1',
            [id]
        );

        if (claimResult.rows.length === 0) {
            return res.status(404).send('Claim not found');
        }

        const detailsResult = await pool.query(
            'SELECT * FROM claim_details WHERE claim_id = $1',
            [id]
        );

        const vehicleResult = await pool.query(
            'SELECT * FROM vehicle_info WHERE claim_id = $1',
            [id]
        );

        const documentsResult = await pool.query(
            'SELECT * FROM documents WHERE claim_id = $1 ORDER BY id DESC',
            [id]
        );

        const financeTasksResult = await pool.query(
            'SELECT * FROM finance_tasks WHERE claim_id = $1 ORDER BY id DESC',
            [id]
        );

        res.json({
            claim: claimResult.rows[0],
            details: detailsResult.rows[0] || null,
            vehicle: vehicleResult.rows[0] || null,
            documents: documentsResult.rows,
            financeTasks: financeTasksResult.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching claim');
    }
});

// Get all finance tasks
app.get('/finance/tasks', async (req, res) => {
    const { status, regionCode } = req.query;

    try {
        let query = `
            SELECT
                ft.*,
                c.reference_number,
                c.status AS claim_status,
                r.code AS region_code,
                r.name AS region_name,
                cd.full_name,
                cd.policy_number,
                au.full_name AS assigned_user_name
            FROM finance_tasks ft
            JOIN claims c ON c.id = ft.claim_id
            JOIN regions r ON r.id = ft.region_id
            LEFT JOIN claim_details cd ON cd.claim_id = c.id
            LEFT JOIN app_users au ON au.id = ft.assigned_user_id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (status) {
            query += ` AND ft.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (regionCode) {
            query += ` AND r.code = $${paramIndex}`;
            params.push(regionCode);
            paramIndex++;
        }

        query += ` ORDER BY ft.id DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching finance tasks');
    }
});

// Get finance tasks by region code
app.get('/finance/tasks/region/:regionCode', async (req, res) => {
    const { regionCode } = req.params;

    try {
        const result = await pool.query(
            `SELECT
                ft.*,
                c.reference_number,
                c.status AS claim_status,
                r.code AS region_code,
                r.name AS region_name,
                cd.full_name,
                cd.policy_number,
                au.full_name AS assigned_user_name
             FROM finance_tasks ft
             JOIN claims c ON c.id = ft.claim_id
             JOIN regions r ON r.id = ft.region_id
             LEFT JOIN claim_details cd ON cd.claim_id = c.id
             LEFT JOIN app_users au ON au.id = ft.assigned_user_id
             WHERE r.code = $1
             ORDER BY ft.id DESC`,
            [regionCode]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching finance tasks by region');
    }
});

// Get one finance task with full claim details
app.get('/finance/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;

    try {
        const data = await getFinanceTaskDetails(taskId);

        if (!data) {
            return res.status(404).send('Finance task not found');
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching finance task details');
    }
});

// Claim task
app.post('/finance/tasks/:taskId/claim', async (req, res) => {
    const { taskId } = req.params;
    const { userId } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const task = await getOpenFinanceTaskForUpdate(client, taskId);

        if (!task) {
            await client.query('ROLLBACK');
            return res.status(404).send('Task not found');
        }

        if (task.status === 'COMPLETED') {
            await client.query('ROLLBACK');
            return res.status(400).send('Task is already completed');
        }

        if (task.assigned_user_id) {
            await client.query('ROLLBACK');
            return res.status(400).send('Task already claimed');
        }

        await client.query(
            `UPDATE finance_tasks
             SET assigned_user_id = $1,
                 status = 'ASSIGNED',
                 updated_at = NOW()
             WHERE id = $2`,
            [userId, taskId]
        );

        await client.query(
            `UPDATE claims
             SET assigned_finance_user_id = $1
             WHERE id = $2`,
            [userId, task.claim_id]
        );

        await client.query(
            `INSERT INTO finance_task_history (finance_task_id, action, action_by, comment)
             VALUES ($1, $2, $3, $4)`,
            [taskId, 'CLAIMED', userId, 'Task claimed by user']
        );

        await client.query('COMMIT');

        res.json({ message: 'Task claimed successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error claiming task');
    } finally {
        client.release();
    }
});

// Release task
app.post('/finance/tasks/:taskId/release', async (req, res) => {
    const { taskId } = req.params;
    const { userId } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const task = await getOpenFinanceTaskForUpdate(client, taskId);

        if (!task) {
            await client.query('ROLLBACK');
            return res.status(404).send('Task not found');
        }

        if (task.status === 'COMPLETED') {
            await client.query('ROLLBACK');
            return res.status(400).send('Task is already completed');
        }

        if (Number(task.assigned_user_id) !== Number(userId)) {
            await client.query('ROLLBACK');
            return res.status(403).send('You can only release your own task');
        }

        await client.query(
            `UPDATE finance_tasks
             SET assigned_user_id = NULL,
                 status = 'PENDING',
                 updated_at = NOW()
             WHERE id = $1`,
            [taskId]
        );

        await client.query(
            `UPDATE claims
             SET assigned_finance_user_id = NULL
             WHERE id = $1`,
            [task.claim_id]
        );

        await client.query(
            `INSERT INTO finance_task_history (finance_task_id, action, action_by, comment)
             VALUES ($1, $2, $3, $4)`,
            [taskId, 'RELEASED', userId, 'Task released back to queue']
        );

        await client.query('COMMIT');

        res.json({ message: 'Task released successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error releasing task');
    } finally {
        client.release();
    }
});

// Assign task
app.post('/finance/tasks/:taskId/assign', async (req, res) => {
    const { taskId } = req.params;
    const { assignedUserId, userId } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const task = await getOpenFinanceTaskForUpdate(client, taskId);

        if (!task) {
            await client.query('ROLLBACK');
            return res.status(404).send('Task not found');
        }

        if (task.status === 'COMPLETED') {
            await client.query('ROLLBACK');
            return res.status(400).send('Task is already completed');
        }

        await client.query(
            `UPDATE finance_tasks
             SET assigned_user_id = $1,
                 status = 'ASSIGNED',
                 updated_at = NOW()
             WHERE id = $2`,
            [assignedUserId, taskId]
        );

        await client.query(
            `UPDATE claims
             SET assigned_finance_user_id = $1
             WHERE id = $2`,
            [assignedUserId, task.claim_id]
        );

        await client.query(
            `INSERT INTO finance_task_history (finance_task_id, action, action_by, comment)
             VALUES ($1, $2, $3, $4)`,
            [taskId, 'ASSIGNED', userId, `Task assigned to user ${assignedUserId}`]
        );

        await client.query('COMMIT');

        res.json({ message: 'Task assigned successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error assigning task');
    } finally {
        client.release();
    }
});

// Accept task
app.post('/finance/tasks/:taskId/accept', async (req, res) => {
    const { taskId } = req.params;
    const { userId, comment } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const task = await getOpenFinanceTaskForUpdate(client, taskId);

        if (!task) {
            await client.query('ROLLBACK');
            return res.status(404).send('Task not found');
        }

        if (task.status === 'COMPLETED') {
            await client.query('ROLLBACK');
            return res.status(400).send('Task is already completed');
        }

        if (task.assigned_user_id && Number(task.assigned_user_id) !== Number(userId)) {
            await client.query('ROLLBACK');
            return res.status(403).send('Task is assigned to another user');
        }

        await client.query(
            `UPDATE finance_tasks
             SET assigned_user_id = COALESCE(assigned_user_id, $1),
                 status = 'COMPLETED',
                 outcome = 'ACCEPTED',
                 updated_at = NOW(),
                 completed_at = NOW()
             WHERE id = $2`,
            [userId, taskId]
        );

        await client.query(
            `UPDATE claims
             SET status = 'ACCEPTED',
                 assigned_finance_user_id = COALESCE(assigned_finance_user_id, $1),
                 decision_by = $1,
                 decision_at = NOW(),
                 decision_comment = $2
             WHERE id = $3`,
            [userId, comment || null, task.claim_id]
        );

        await client.query(
            `INSERT INTO finance_task_history (finance_task_id, action, action_by, comment)
             VALUES ($1, $2, $3, $4)`,
            [taskId, 'ACCEPTED', userId, comment || 'Task accepted']
        );

        await client.query('COMMIT');

        res.json({ message: 'Task accepted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error accepting task');
    } finally {
        client.release();
    }
});

// Return task
app.post('/finance/tasks/:taskId/return', async (req, res) => {
    const { taskId } = req.params;
    const { userId, comment } = req.body;

    const client = await pool.connect();

    try {
        if (!comment || !String(comment).trim()) {
            return res.status(400).send('Comment is required for return');
        }

        await client.query('BEGIN');

        const task = await getOpenFinanceTaskForUpdate(client, taskId);

        if (!task) {
            await client.query('ROLLBACK');
            return res.status(404).send('Task not found');
        }

        if (task.status === 'COMPLETED') {
            await client.query('ROLLBACK');
            return res.status(400).send('Task is already completed');
        }

        if (task.assigned_user_id && Number(task.assigned_user_id) !== Number(userId)) {
            await client.query('ROLLBACK');
            return res.status(403).send('Task is assigned to another user');
        }

        await client.query(
            `UPDATE finance_tasks
             SET assigned_user_id = COALESCE(assigned_user_id, $1),
                 status = 'COMPLETED',
                 outcome = 'RETURNED',
                 updated_at = NOW(),
                 completed_at = NOW()
             WHERE id = $2`,
            [userId, taskId]
        );

        await client.query(
            `UPDATE claims
             SET status = 'RETURNED',
                 assigned_finance_user_id = COALESCE(assigned_finance_user_id, $1),
                 decision_by = $1,
                 decision_at = NOW(),
                 decision_comment = $2
             WHERE id = $3`,
            [userId, comment, task.claim_id]
        );

        await client.query(
            `INSERT INTO finance_task_history (finance_task_id, action, action_by, comment)
             VALUES ($1, $2, $3, $4)`,
            [taskId, 'RETURNED', userId, comment]
        );

        await client.query('COMMIT');

        res.json({ message: 'Task returned successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error returning task');
    } finally {
        client.release();
    }
});

// Reject task
app.post('/finance/tasks/:taskId/reject', async (req, res) => {
    const { taskId } = req.params;
    const { userId, comment } = req.body;

    const client = await pool.connect();

    try {
        if (!comment || !String(comment).trim()) {
            return res.status(400).send('Comment is required for reject');
        }

        await client.query('BEGIN');

        const task = await getOpenFinanceTaskForUpdate(client, taskId);

        if (!task) {
            await client.query('ROLLBACK');
            return res.status(404).send('Task not found');
        }

        if (task.status === 'COMPLETED') {
            await client.query('ROLLBACK');
            return res.status(400).send('Task is already completed');
        }

        if (task.assigned_user_id && Number(task.assigned_user_id) !== Number(userId)) {
            await client.query('ROLLBACK');
            return res.status(403).send('Task is assigned to another user');
        }

        await client.query(
            `UPDATE finance_tasks
             SET assigned_user_id = COALESCE(assigned_user_id, $1),
                 status = 'COMPLETED',
                 outcome = 'REJECTED',
                 updated_at = NOW(),
                 completed_at = NOW()
             WHERE id = $2`,
            [userId, taskId]
        );

        await client.query(
            `UPDATE claims
             SET status = 'REJECTED',
                 assigned_finance_user_id = COALESCE(assigned_finance_user_id, $1),
                 decision_by = $1,
                 decision_at = NOW(),
                 decision_comment = $2
             WHERE id = $3`,
            [userId, comment, task.claim_id]
        );

        await client.query(
            `INSERT INTO finance_task_history (finance_task_id, action, action_by, comment)
             VALUES ($1, $2, $3, $4)`,
            [taskId, 'REJECTED', userId, comment]
        );

        await client.query('COMMIT');

        res.json({ message: 'Task rejected successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error rejecting task');
    } finally {
        client.release();
    }
});

// Resubmit claim (reuse same finance task)
app.post('/claims/:id/resubmit', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const claimResult = await client.query(
            `SELECT * FROM claims WHERE id = $1 FOR UPDATE`,
            [id]
        );

        if (claimResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).send('Claim not found');
        }

        const claim = claimResult.rows[0];

        if (claim.status !== 'RETURNED') {
            await client.query('ROLLBACK');
            return res.status(400).send('Only RETURNED claims can be resubmitted');
        }

        const taskResult = await client.query(
            `SELECT *
             FROM finance_tasks
             WHERE claim_id = $1
             ORDER BY id DESC
             LIMIT 1
             FOR UPDATE`,
            [id]
        );

        if (taskResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).send('No finance task found');
        }

        const task = taskResult.rows[0];

        const updatedClaimResult = await client.query(
            `UPDATE claims
             SET status = 'SUBMITTED',
                 resubmission_count = COALESCE(resubmission_count, 0) + 1,
                 decision_by = NULL,
                 decision_at = NULL,
                 decision_comment = NULL,
                 assigned_finance_user_id = NULL
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        const updatedClaim = updatedClaimResult.rows[0];

        await client.query(
            `UPDATE finance_tasks
             SET status = 'PENDING',
                 assigned_user_id = NULL,
                 outcome = NULL,
                 completed_at = NULL,
                 updated_at = NOW()
             WHERE id = $1`,
            [task.id]
        );

        await client.query(
            `INSERT INTO finance_task_history (finance_task_id, action, action_by, comment)
             VALUES ($1, $2, $3, $4)`,
            [task.id, 'RESUBMITTED', userId, 'Claim resubmitted by requestor']
        );

        await client.query('COMMIT');

        res.json({
            message: 'Claim resubmitted successfully (task reused)',
            claim: updatedClaim,
            financeTaskId: task.id,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error resubmitting claim');
    } finally {
        client.release();
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
