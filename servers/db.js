require('dotenv').config();

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.db_servername,
    user: process.env.db_username,
    password: process.env.db_password,
    database: process.env.db_name
});

db.connect(function(err) {
    if (err) {
        console.log('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database!');
    }
});

module.exports = db;