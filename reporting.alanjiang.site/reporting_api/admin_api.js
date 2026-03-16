const express = require('express');
const { requireAuth, requireRole } = require('./auth');
const bcrypt = require('bcrypt');
const router = express.Router();
const path = require('path');
const domainDir = '/var/www/reporting.alanjiang.site';

//get admin page
router.get('/api/admin', requireAuth, requireRole('admin', 'owner'), (req, res) => {
    res.sendFile(path.join(domainDir, 'protected', 'admin.html'));
});



router.get('/api/users', requireRole('admin', 'owner'), async (req, res) => {
    try {
        const pool = req.app.get('pool');
        const { rows } = await pool.query(`
            SELECT 
                id, email, display_name, role 
            FROM 
                users 
            ORDER BY 
                created_at`
            );
        res.json({ success: true, data: rows });
    } catch(err) {
        console.error('List users error: ', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.post('/api/users', requireRole('admin', 'owner'), async (req,res) => {
    try {
        const { email, display_name, password, role } = req.body;
        const pool = req.app.get('pool');
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query(`
            INSERT INTO users 
                (email, display_name, password_hash, role) 
                VALUES 
                    ($1, $2, $3, $4)`, 
            [
                email,
                display_name,
                passwordHash,
                role
            ]
        );

        res.status(200).json({ success: true });
    } catch(err) {
        console.error('List users error: ', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.put('/api/users/:id', requireRole('admin', 'owner'), async (req, res) => {

    // const isSelf = req.user.id === parseInt(req.params.id);

    // if (isSelf && req.user.role !== req.body.role) {
    //     return res.status(403).json({ success: false, error: 'Cannot change your own role' });
    // }

    try {
        const { email, display_name, password, role } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }

        if (display_name.trim().length < 2 || display_name.trim().length > 50) {
            return res.status(400).json({ success: false, error: 'Display name must be between 2 and 50 characters' });
        }

        const nameRegex = /^[a-zA-Z0-9 _-]+$/;
        if (!nameRegex.test(display_name.trim())) {
            return res.status(400).json({ success: false, error: 'Display name contains invalid characters' });
        }

        if (password !== undefined) {
            if (password.length < 8) {
                return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
            }
            if (password.length > 72) {
                return res.status(400).json({ success: false, error: 'Password cannot exceed 72 characters' });
            }
        }
        
        const pool = req.app.get('pool');
        const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.params.id]);
        const passwordHash = password 
            ? await bcrypt.hash(password, 10) 
            : result.rows[0].password_hash;
        
        await pool.query(`
            UPDATE users 
            SET
                email = $1, 
                display_name = $2,
                password_hash = $3, 
                role = $4
            WHERE id = $5`, 
            [
                email,
                display_name,
                passwordHash,
                role,
                req.params.id
            ]
        );

        res.status(200).json({ success: true });
    } catch(err) {
        console.error('List users error: ', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.delete('/api/users/:id', requireRole('admin', 'owner'), async (req, res) => {

    // if (req.user.id === parseInt(req.params.id)) {
    //     return res.status(403).json({ success: false, error: 'Cannot delete your own account' });
    // }
    console.log(req);
    try {
        // const { email, display_name, password, role } = req.body;
        const pool = req.app.get('pool');
        await pool.query(`
            DELETE FROM users
            WHERE 
                id = $1`, 
            [
                req.params.id
            ]
        );

        res.status(200).json({ success: true });
    } catch(err) {
        console.error('List users error: ', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;