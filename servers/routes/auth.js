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

// handle POST requests to /api/login
router.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    // input validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    // look up user by email
    var sql = "SELECT * FROM users WHERE email = '" + email + "'";

    db.query(sql, async function (err, results) {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Database error during login.' });
        }

        // check if user exists
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        var user = results[0];

        try {
            // compare plain password with hashedPassword from database
            var passwordMatch = await bcrypt.compare(password, user.hashedPassword);

            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }

            // set cookie with userID
            res.cookie('userID', user.userID, { httpOnly: true });

            // return JSON response for the frontend
            res.status(200).json({
                message: 'Login successful!',
                user: {
                    userID: user.userID,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Server error verifying password.' });
        }
    });
});

// handle POST requests to /api/logout
router.post('/logout', function (req, res) {
    res.clearCookie('userID');
    res.status(200).json({ message: 'Logged out successfully.' });
});

// exports router module
module.exports = router;