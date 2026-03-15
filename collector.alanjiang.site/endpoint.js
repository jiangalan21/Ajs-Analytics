const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'analytics.jsonl');


//REMEMBER TO CHANGE APACHE CONF FOR NEW ENDPOINTS; ***YOU WILL CORS ERROR WITHOUT THIS***
// CORS middleware
app.use((req, res, next) => {
  const origin = 'https://www.test.alanjiang.site';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Vary', 'Origin');
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
            id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            session_id  UUID,
            name        VARCHAR(128) NOT NULL,
            type        VARCHAR(128),
            data        JSONB,
            url         VARCHAR(2048),
            server_ts   TIMESTAMPTZ,
            created_at   TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
        CREATE INDEX IF NOT EXISTS idx_events_type    ON events(type);
        CREATE INDEX IF NOT EXISTS idx_events_server_ts ON events(server_ts);

        CREATE TABLE IF NOT EXISTS performance (
            ID          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            session_id  UUID,
            url         VARCHAR(2048),
            ttfb        INTEGER check (ttfb >= 0),
            dom_content_loaded INTEGER check (dom_content_loaded >= 0),
            dom_complete INTEGER check (dom_complete >= 0),
            load_time    INTEGER check (load_time >= 0),
            lcp         REAL check (lcp >= 0),
            cls         NUMERIC(8, 4) check (cls >= 0),
            inp        REAL check (inp >= 0),
            fcp       REAL check (fcp >= 0),
            transfer_size INTEGER check (transfer_size >= 0),
            resource_count SMALLINT check (resource_count >= 0),
            server_ts   TIMESTAMPTZ,
            created_at   TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    console.log('Database initialized');
}


// sendBeacon endpoint
app.post('/collect', async (req, res) => {
    let payload = req.body;

    if (!payload || !payload.url) {
        console.log({ error: 'Missing required fields: url' })
        return res.status(400);
    }

    const allowedTypes = ['prefire', 'page_entry', 'page_exit','idle_break', 'click', 'scroll_depth', 'scroll_final', 'vital'];
    if (!payload.type || !allowedTypes.includes(payload.type)) {
        console.log({ payload: payload, error: 'Invalid or missing event type' })
        return res.status(400);
    }

    const sessionId = payload.session || payload.sessionId || 'unknown_session';
    const serverTimestamp = new Date().toISOString();
    // const clientIp = req.ip;

    const line = JSON.stringify(payload) + '\n';
    fs.appendFile(LOG_FILE, line, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
            return res.status(500);
        }
    });
    if (payload.type === 'prefire'){
        try {
            await pool.query(
                // `INSERT INTO events 
                //     (session_id, name, type, data, url, server_ts)
                //  VALUES 
                //     ($1, $2, $3, $4, $5, $6, $7)`,
                // [
                //     sessionId,
                //     payload.name || null,
                //     payload.type,
                //     payload.data ? JSON.stringify(payload.data) : null,
                //     payload.url,
                //     serverTimestamp
                // ]
                `INSERT INTO performance
                    (session_id, url, ttfb, dom_content_loaded, dom_complete, load_time, 
                    lcp, cls, inp, fcp, transfer_size, resource_count, server_ts)
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                    [
                        sessionId,
                        payload.url,
                        payload.performance?.ttfb || null,
                        payload.performance?.domInteractive || null, //content_loaded
                        payload.performance?.domComplete || null,
                        payload.performance?.total || null, //load_time
                        payload.performance?.lcp || null,
                        payload.performance?.cls || null,
                        payload.performance?.inp || null,
                        payload.performance?.fcp || null,
                        payload.performance?.transferSize || null,
                        payload.performance?.resourceCount || null,
                        serverTimestamp,
                    ]
            );
            console.log("Payload:", payload);
        } catch (err) {
            console.error('DB insert error:', err.message);
            // Even if DB fails, send a 200 or 204 so the frontend CORS doesn't scream
            return res.status(500);
        }
    }
    if (payload.type === 'vital') {
        const column = payload.data.name.toLowerCase();
        const allowed = ['lcp', 'cls', 'inp', 'fcp'];

        if (!allowed.includes(column)) return res.status(400).end();
        try {
            await pool.query(
                `UPDATE performance 
                SET ${column} = $1 
                WHERE session_id = $2 AND url = $3`,
                [payload.value, payload.sessionId, payload.url]
            );
            res.sendStatus(204);
        } catch (err) {
            console.error('DB update error: ', err.message)
            return res.status(500);
        }
    }
    
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