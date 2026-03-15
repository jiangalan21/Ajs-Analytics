const express = require('express');
const { requireAuth, requireRole } = require('./auth');
const bcrypt = require('bcrypt');
const router = express.Router();

//get admin page
router.get('/api/admin', requireAuth, requireRole('admin', 'owner'), (req, res) => {
    res.sendFile(path.join(domainDir, 'protected', req.params.page + '.html'));
});



router.get('/api/users', requireRole('admin', 'owner'), async (req, res) => {
    try {
        const pool = req.app.get('pool');
        console.log(pool);
        const { rows } = await pool.query(`
            SELECT 
                id, email, display_name, role 
            FROM 
                users 
            ORDER BY 
                created_at`
            );
        console.log(rows);
        res.json({ success: true, data: rows });
    } catch(err) {
        console.error('List users error: ', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.post('/api/users', requireRole('admin', 'owner'), async (req,res) => {
    try {
        const data = req.body;
        const pool = req.app.get('pool');
        const passwordHash = await bcrypt.hash(data.password, 10);
        await pool.query(`
            INSERT INTO users 
                (email, display_name, password_hash, role) 
                VALUES 
                    ($1, $2, $3, $4)`, 
            [
                data.email,
                data.display_name,
                passwordHash,
                data.role
            ]
        );

        res.status(200).json({ success: true });
    } catch(err) {
        console.error('List users error: ', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;