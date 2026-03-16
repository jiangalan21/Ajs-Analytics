const express = require('express');
const { requireAuth, requireRole } = require('./auth');
const bcrypt = require('bcrypt');
const router = express.Router();
const path = require('path');
const domainDir = '/var/www/reporting.alanjiang.site';

router.get('/api/pageviews', requireAuth, requireRole('admin', 'owner'), (req, res) => {
    res.sendFile(path.join(domainDir, 'protected', 'pageviews.html'));
});

//get pageview report
router.get('/api/pageviews/report', requireAuth, requireRole('analyst', 'admin', 'owner'), (req, res) => {
    
});

router.post('/api/pageviews/report', requireAuth, requireRole('analyst', 'admin', 'owner'), (req, res) => {

});

module.exports = router;
