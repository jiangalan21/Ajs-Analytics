const express = require('express');
const { sessionMiddleware, requireAuth } = require('./auth');
const { Pool } = require('pg');
const { loginRoute, logoutRoute } = require('./auth');

const app = express();
const PORT = 3007;

app.use(sessionMiddleware);
app.use(express.json());

app.use((req, res, next) => {
    const origin = 'http://www.reporting.alanjiang.site';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});


const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'analytics',
    user: 'postgres',
    password: 'awesome21'
});

function getDateRange(query) {
    const end = query.end || new Date().toISOString().slice(0, 10);
    const start = query.start || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    return [start + ' 00:00:00+00', end + ' 23:59:59+00'];
}
    
app.post('/api/login', loginRoute(pool));

app.post('/api/logout', logoutRoute);

app.get('/api/dashboard', requireAuth, (req, res) => {
    requireAuth(req, res, async () => {
        try {
            res.json({data: 'This is dashboard data'});
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            res.status(500).json({ error: 'Failed to fetch dashboard data' });
        }
    });
});

app.get('/api/performance', requireAuth, async (req, res) => {
    try {
        const [start, end] = getDateRange(req.query);
        const { rows } = await pool.query(
            `SELECT url,
                    ROUND(AVG(load_time)) AS avg_load_ms,
                    ROUND(AVG(ttfb)) AS avg_ttfb_ms,
                    ROUND(AVG(lcp)::numeric, 2) AS avg_lcp,
                    ROUND(AVG(cls)::numeric, 4) AS avg_cls,
                    COUNT(*) AS samples
             FROM performance
             WHERE server_ts BETWEEN $1::TIMESTAMPTZ AND $2::TIMESTAMPTZ
             GROUP BY url ORDER BY avg_load_ms DESC LIMIT 20`,
            [start, end]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error fetching performance data:', err);
        res.status(500).json({ error: 'Failed to fetch performance data' });
    }
});

app.get('/api/events', async (req, res) => {
  try {
    const { rows } = await pool.query(
        'SELECT * FROM events ORDER BY serverTimeStamp DESC LIMIT 3'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch events' }); }
});



// app.get('/events/:sessionId', async (req, res) => {
//   try {
//         const { rows } = await pool.query('SELECT * FROM events WHERE session_id = $1 ORDER BY serverTimeStamp DESC', [req.params.sessionId]);
//         if (!rows.length) return res.status(404);
//         res.json(rows[0]);
//     } catch (err) { res.status(500).json({ error: err.message }); }
  
// });


// app.post('/events', async (req, res) => {
//   const p = req.body;
//     try {
//         const { rows } = await pool.query(
//             `INSERT INTO events (session_id, user_agent, type, url, app, referrer, title, ip, static, performance, clientTimeStamp, serverTimeStamp)
//              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
//             [p.session_id||null, p.user_agent||null, p.type, p.url||null, p.app||null, p.referrer||null, p.title||null, p.ip||null,
//              p.static ? JSON.stringify(p.static) : null,
//              p.performance ? JSON.stringify(p.performance) : null, p.clientTimeStamp||null, p.serverTimeStamp||null]
//         );
//         res.status(201).json(rows[0]);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.put('/events/:id', async (req, res) => {
//     const p = req.body;
//     try {
//         const { rows } = await pool.query(
//             `UPDATE events SET session_id=$1, type=$2, url=$3, data=$4 WHERE id=$5 RETURNING *`,
//             [p.session_id||null, p.type||null, p.url||null, p.data ? JSON.stringify(p.data) : null, req.params.id]
//         );
//         if (!rows.length) return res.status(404).json({ error: 'Not found' });
//         res.json(rows[0]);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// app.delete('/events/:id', async (req, res) => {
//     try {
//         await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
//         res.sendStatus(204);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });


app.listen(PORT, () => {
    console.log(`Reporting API listening at http://localhost:${PORT}`);
});