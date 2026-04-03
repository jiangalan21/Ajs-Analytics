const express = require('express');

const app = express();
const PORT = 3008

app.use(express.json())

app.post('/submit', (req, res) => {
    console.log(req.body.data)
    res.json({ data: 'pussy' });
})

app.listen(PORT, () => {
    console.log(`Reporting API listening at http://localhost:${PORT}`);
});