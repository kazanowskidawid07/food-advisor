const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // third party module for password hashing
const db = require('../db'); // local custom module for MySQL connection

// handle POST requests to /api/register
router.post('/register', async function (req, res) {
    // read JSON fields parsed by express.json() middleware
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    // input validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // hash password using bcrypt
        var hashedPassword = await bcrypt.hash(password, 10);

        var sql = "INSERT INTO users (username, email, hashedPassword) VALUES ('" + username + "', '" + email + "', '" + hashedPassword + "')";

        // execute database query
        db.query(sql, function (err, result) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'An account with this email already exists.' });
                }
                console.log(err);
                return res.status(500).json({ message: 'Database error during registration.' });
            }

            console.log('1 record inserted');

            // return JSON response for the frontend
            res.status(201).json({ message: 'Registration successful!' });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error hashing password.' });
    }
});

// exports router module
module.exports = router;