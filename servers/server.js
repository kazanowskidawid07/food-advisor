const express = require('express');

const db = require('./db');

const app = express();

const PORT = 3000;

// Test route
app.get('/', function(req, res) {
    res.send('Food Advisor server is running!');
});

// Start the server
app.listen(PORT, function() {
    console.log('Server running on port ' + PORT);
});