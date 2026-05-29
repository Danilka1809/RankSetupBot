const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Раздача статики
app.use(express.static('public'));

// API для получения статуса
app.get('/api/status', (req, res) => {
    try {
        const status = fs.readFileSync('public/status.json', 'utf8');
        res.json(JSON.parse(status));
    } catch (err) {
        res.json({ online: false, error: 'No data yet' });
    }
});

app.listen(PORT, () => {
    console.log(`🌐 Сайт доступен на http://localhost:${PORT}`);
});
