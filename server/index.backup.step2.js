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

// Submit claim
app.put('/claims/:id/submit', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE claims SET status = $1 WHERE id = $2 RETURNING *',
            ['SUBMITTED', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Claim not found');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error submitting claim');
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

        res.json({
            claim: claimResult.rows[0],
            details: detailsResult.rows[0] || null,
            vehicle: vehicleResult.rows[0] || null,
            documents: documentsResult.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching claim');
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});