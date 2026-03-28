// ==========================
// FINANCE TASK ACTIONS
// ==========================

// Claim task
app.post('/finance/tasks/:taskId/claim', async (req, res) => {
    const { taskId } = req.params;
    const { userId } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const taskResult = await client.query(
            `SELECT * FROM finance_tasks WHERE id = $1 FOR UPDATE`,
            [taskId]
        );

        if (taskResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).send('Task not found');
        }

        const task = taskResult.rows[0];

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

        const taskResult = await client.query(
            `SELECT * FROM finance_tasks WHERE id = $1 FOR UPDATE`,
            [taskId]
        );

        if (taskResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).send('Task not found');
        }

        const task = taskResult.rows[0];

        if (task.assigned_user_id !== userId) {
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


// Assign task (Supervisor action)
app.post('/finance/tasks/:taskId/assign', async (req, res) => {
    const { taskId } = req.params;
    const { assignedUserId, userId } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const taskResult = await client.query(
            `SELECT * FROM finance_tasks WHERE id = $1 FOR UPDATE`,
            [taskId]
        );

        if (taskResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).send('Task not found');
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
            `INSERT INTO finance_task_history (finance_task_id, action, action_by, comment)
             VALUES ($1, $2, $3, $4)`,
            [taskId, 'ASSIGNED', userId, 'Task assigned by supervisor']
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