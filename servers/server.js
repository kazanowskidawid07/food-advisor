const express = require('express');
const path = require('path') // core path module
const db = require('./db');

const app = express();

app.use(express.json()) // This allows your server to read incoming JSON data when the
                        // frontend submits forms or data (like new reviews or user signups).

app.use(express.static(path.join(__dirname,'../public')));

// serves the HTML files directly at the root URL so links like "login.html" work
app.use(express.static(path.join(__dirname, '../public/html')));

const PORT = 3000;

// Added path module + Updated app.get in server.js to send home.html instead of plain text
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname,'../public/html/home.html'));
});

// Start the server
app.listen(PORT, function() {
    console.log('Server running on port ' + PORT);
});