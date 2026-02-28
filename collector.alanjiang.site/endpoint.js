const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'analytics.jsonl');

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  // no-cache enabled
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(express.static(__dirname));

const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'analytics',
    user: 'postgres',
    password: 'awesome21',
});

//Create table if it doesn't exist
async function initDB() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS events (
            id          SERIAL PRIMARY KEY,
            session_id  TEXT,
            user_id     TEXT,
            type        TEXT NOT NULL,
            url         TEXT,
            app         TEXT,
            referrer    TEXT,
            title       TEXT,
            ip          TEXT,
            data        JSONB,
            static      JSONB,
            performance JSONB,
            client_ts   TIMESTAMPTZ,
            server_ts   TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
        CREATE INDEX IF NOT EXISTS idx_events_type    ON events(type);
        CREATE INDEX IF NOT EXISTS idx_events_server_ts ON events(server_ts);
    `);
    console.log('Database initialized');
}





// sendBeacon endpoint
app.post('/collect', async (req, res) => {
    let payload = req.body;

    if (!payload || !payload.url || !payload.type) {
        return res.status(400).json({ error: 'Missing required fields: url, type' });
    }

    const sessionId = payload.session || payload.sessionId || 'unknown_session';
    payload.serverTimestamp = new Date().toISOString();
    payload.ip = req.ip;

    const line = JSON.stringify(payload) + '\n';
    fs.appendFile(LOG_FILE, line, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
            
        }
    });

    try {
        await pool.query(
            `INSERT INTO events 
                (session_id, user_id, type, url, app, referrer, title, ip, data, static, performance, client_ts)
             VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
                sessionId,
                payload.userId || null,
                payload.type,
                payload.url,
                payload.app || null,
                payload.referrer || null,
                payload.title || null,
                req.ip,
                payload.data ? JSON.stringify(payload.data) : null,
                payload.static ? JSON.stringify(payload.static) : null,
                payload.performance ? JSON.stringify(payload.performance) : null,
                payload.timestamp || null,
            ]
        );
        console.log("Payload:", payload);
    } catch (err) {
        console.error('DB insert error:', err.message);
        // Even if DB fails, send a 200 or 204 so the frontend CORS doesn't scream
        res.status(500);
    }
    res.sendStatus(204);
});



app.get('/events', async (req, res) => {
  try {
    const { rows } = await pool.query(
        'SELECT * FROM events ORDER BY server_ts DESC LIMIT 50'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch events' }); }
});



app.get('/events/:sessionId', async (req, res) => {
  try {
        const { rows } = await pool.query('SELECT * FROM events WHERE session_id = $1 ORDER BY server_ts DESC', [req.params.sessionId]);
        if (!rows.length) return res.status(404);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  
});


app.post('/events', async (req, res) => {
  const p = req.body;
    try {
        const { rows } = await pool.query(
            `INSERT INTO events (session_id, user_id, type, url, app, referrer, title, ip, data, static, performance, client_ts)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
            [p.session_id||null, p.user_id||null, p.type, p.url||null, p.app||null, p.referrer||null, p.title||null, p.ip||null,
             p.data ? JSON.stringify(p.data) : null, p.static ? JSON.stringify(p.static) : null,
             p.performance ? JSON.stringify(p.performance) : null, p.client_ts||null]
        );
        res.status(201).json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/events/:id', async (req, res) => {
    const p = req.body;
    try {
        const { rows } = await pool.query(
            `UPDATE events SET session_id=$1, type=$2, url=$3, data=$4 WHERE id=$5 RETURNING *`,
            [p.session_id||null, p.type||null, p.url||null, p.data ? JSON.stringify(p.data) : null, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/events/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
        res.sendStatus(204);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


app.listen(PORT, () => {
    console.log(`Analytics endpoint listening on http://localhost:${PORT}`);
    console.log(`Test page: http://localhost:${PORT}/test.html`);
    console.log(`Data file: ${LOG_FILE}`);
  });
initDB().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});