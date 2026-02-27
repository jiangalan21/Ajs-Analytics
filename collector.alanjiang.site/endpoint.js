const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'analytics.jsonl');


// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

// sendBeacon endpoint
app.post('/collect', (req, res) => {
    let payload = req.body;

    if (!payload || !payload.url || !payload.type) {
        return res.status(400).json({ error: 'Missing required fields: url, type' });
    }

    payload.serverTimestamp = new Date().toISOString();
    payload.ip = req.ip;

    const line = JSON.stringify(payload) + '\n';
    fs.appendFile(LOG_FILE, line, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
            return res.sendStatus(500).json({ error: 'Failed to log data' });
        }
        res.sendStatus(204);
    });

    console.log("Payload: ", req.body);

});

// listen for sendBeacon requests on PORT:3000
app.listen(PORT, () => {
  console.log(`Analytics endpoint listening on http://localhost:${PORT}`);
  console.log(`Test page: http://localhost:${PORT}/test.html`);
  console.log(`Data file: ${LOG_FILE}`);
});