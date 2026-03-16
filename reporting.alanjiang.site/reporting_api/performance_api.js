const express = require('express');
const { requireAuth, requireRole } = require('./auth');
const bcrypt = require('bcrypt');
const router = express.Router();
const path = require('path');
const domainDir = '/var/www/reporting.alanjiang.site';

function getDateRange(queryStart, queryEnd) {
    const end = queryEnd || new Date().toISOString().slice(0, 10);
    const start = queryStart || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    return [start, end];
}

// things to communicate
// 

router.get('/api/performance', requireAuth, requireRole('admin', 'owner'), (req, res) => {
    res.sendFile(path.join(domainDir, 'protected', 'performance.html'));
});

//get performance page
router.get('/api/performance/report', requireAuth, requireRole('analyst', 'admin', 'owner'), async (req, res) => {
    //works
    try {
        const [start, end] = getDateRange(req.query);
        const { rows } = await pool.query(
            `SELECT url,
                    ROUND(AVG(load_time)) AS avg_load_ms,
                    ROUND(AVG(ttfb)) AS avg_ttfb_ms,
                    COUNT(*) AS samples
             FROM performance
             WHERE server_ts BETWEEN $1::TIMESTAMPTZ AND $2::TIMESTAMPTZ
             GROUP BY url ORDER BY avg_load_ms DESC LIMIT 20`,
            [start, end]
        );
    } catch(err) {

    }
});

router.post('/api/performance/report', requireAuth, requireRole('analyst', 'admin', 'owner'), async (req, res) => {
    try {
        const category = 'performance';
        const { analysis } = req.body;
        const pool = req.app.get('pool');

        // const { rows } = await pool.query(
        //     `SELECT url,
        //             ROUND(AVG(load_time)) AS avg_load_ms,
        //             ROUND(AVG(ttfb)) AS avg_ttfb_ms,
        //             COUNT(*) AS samples
        //      FROM performance
        //      WHERE server_ts BETWEEN $1::TIMESTAMPTZ AND $2::TIMESTAMPTZ
        //      GROUP BY url ORDER BY avg_load_ms DESC LIMIT 20`,
        //     [start1, end1]
        // );

        // const { rows2 } = await pool.query(
        //     `SELECT url,
        //             ROUND(AVG(load_time)) AS avg_load_ms,
        //             ROUND(AVG(ttfb)) AS avg_ttfb_ms,
        //             COUNT(*) AS samples
        //      FROM performance
        //      WHERE server_ts BETWEEN $1::TIMESTAMPTZ AND $2::TIMESTAMPTZ
        //      GROUP BY url ORDER BY avg_load_ms DESC LIMIT 20`,
        //     [start2, end2]
        // );

        
        // console.log([
        //         category,
        //         req.session.user.id,
        //         req.session.user.username,
        //         analysis,
        //         rows,
        //         req.session.user.role
        //     ]);


        // await pool.query(`
        //     INSERT INTO reports 
        //         (category, user_id, display_name, analysis, data, role) 
        //         VALUES 
        //             ($1, $2, $3, $4, $5, $6)`, 
        //     [
        //         category,
        //         req.session.user.id,
        //         req.session.user.username,
        //         analysis,
        //         rows,
        //         req.session.user.role
        //     ]
        // );
    } catch(err) {

    }
});


router.post('/api/performanceData', requireAuth, async (req, res) => {
    try {
        const { start1, end1, start2, end2 } = req.body;
        const [starts1, ends1] = getDateRange(start1, end1);
        const [starts2, ends2] = getDateRange(start2, end2);
        const pool = req.app.get('pool');
        const { rows: rows1 } = await pool.query(
            `SELECT url,
                    ROUND(AVG(load_time)) AS avg_load_ms,
                    ROUND(AVG(ttfb)) AS avg_ttfb_ms,
                    COUNT(*) AS samples
             FROM performance
             WHERE server_ts BETWEEN $1::TIMESTAMPTZ AND $2::TIMESTAMPTZ
             GROUP BY url ORDER BY avg_load_ms DESC LIMIT 20`,
            [starts1, ends1]
        );

        const { rows: rows2 } = await pool.query(
            `SELECT url,
                    ROUND(AVG(load_time)) AS avg_load_ms,
                    ROUND(AVG(ttfb)) AS avg_ttfb_ms,
                    COUNT(*) AS samples
             FROM performance
             WHERE server_ts BETWEEN $1::TIMESTAMPTZ AND $2::TIMESTAMPTZ
             GROUP BY url ORDER BY avg_load_ms DESC LIMIT 20`,
            [starts2, ends2]
        );
        res.status(200).json( {rows1, rows2} );
    } catch (err) {
        console.error('Error fetching performance data:', err);
        res.status(500).json({ error: 'Failed to fetch performance data' });
    }
});


module.exports = router;