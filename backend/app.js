const express = require('express');
const cors = require('cors');
const { ApifyClient } = require('apify-client');

const app = express();
const port = process.env.PORT || 3000; // Use port 4000 for backend

app.use(cors());
app.use(express.json()); // For parsing application/json

const apifyRoutes = require('./routes/apify');

app.use('/api/apify', apifyRoutes);

app.get('/', (req, res) => {
    res.send('Apify Integration Backend is running!');
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
}); 