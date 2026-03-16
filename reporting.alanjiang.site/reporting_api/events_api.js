const express = require('express');
const { requireAuth, requireRole } = require('./auth');
const bcrypt = require('bcrypt');
const router = express.Router();
const path = require('path');
const domainDir = '/var/www/reporting.alanjiang.site';

router.get('/api/events', requireAuth, requireRole('admin', 'owner'), (req, res) => {
    res.sendFile(path.join(domainDir, 'protected', 'events.html'));
});

//get events report
router.get('/api/events/report', requireAuth, requireRole('analyst', 'admin', 'owner'), (req, res) => {
    
});

router.post('/api/events/report', requireAuth, requireRole('analyst', 'admin', 'owner'), (req, res) => {

});

module.exports = router;
