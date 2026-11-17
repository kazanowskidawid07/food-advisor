const express = require('express');
const path = require('path') // core path module
const db = require('./db');
const bcrypt = require('bcrypt');

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


app.post('/api/register', async function(req, res) {

    const { username, email, password } = req.body;

    // Check that all fields have been provided
    if (!username || !email || !password) {
        return res.status(400).json({
            message: 'Please fill in all fields'
        });
    }

    try {

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const sql = 'INSERT INTO users (username, email, hashedPassword, role) VALUES (?, ?, ?, ?)';

        db.query(sql, [username, email, hashedPassword, 'customer'], function(err, result) {

            if (err) {

                // Check if email already exists
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                        message: 'Email is already registered'
                    });
                }

                console.log(err);

                return res.status(500).json({
                    message: 'Registration failed'
                });
            }

            res.status(201).json({
                message: 'Account created successfully!'
            });

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: 'Something went wrong'
        });

    }

});


// Start the server
app.listen(PORT, function() {
    console.log('Server running on port ' + PORT);
});