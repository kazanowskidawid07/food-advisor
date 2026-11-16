const express = require('express');

const db = require('./db');

const app = express();

app.use(express.json()) // This allows your server to read incoming JSON data when the
                        // frontend submits forms or data (like new reviews or user signups).

const PORT = 3000;

// Test route
app.get('/', function(req, res) {
    res.send('Food Advisor server is running!');
});

// Start the server
app.listen(PORT, function() {
    console.log('Server running on port ' + PORT);
});