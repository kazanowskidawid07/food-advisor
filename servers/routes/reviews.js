const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/reviews - create a new review for a restaurant
router.post('/', function (req, res) {
    const userID = req.cookies.userID;
    if (!userID) {
        return res.status(401).json({ message: 'You must be logged in to leave a review.' });
    }

    const restaurantID = parseInt(req.body.restaurantID, 10);
    const rating = parseInt(req.body.rating, 10);
    const comment = (req.body.comment || '').trim();

    if (!restaurantID || isNaN(rating) || rating < 1 || rating > 5 || !comment) {
        return res.status(400).json({ message: 'Valid restaurant, rating (1-5), and comment are required.' });
    }

    const sql = 'INSERT INTO reviews (userID, restaurantID, rating, comment) VALUES (?, ?, ?, ?)';
    db.query(sql, [userID, restaurantID, rating, comment], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error saving review.' });
        }

        res.status(201).json({
            message: 'Review submitted successfully!',
            reviewID: result.insertId
        });
    });
});

// DELETE /api/reviews/:id - delete a review (author or admin)
router.delete('/:id', function (req, res) {
    const userID = req.cookies.userID;
    const reviewID = parseInt(req.params.id, 10);

    if (!userID) {
        return res.status(401).json({ message: 'You must be logged in.' });
    }

    db.query('SELECT role FROM users WHERE userID = ?', [userID], function (err, userResults) {
        if (err || userResults.length === 0) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        const isAdmin = userResults[0].role === 'admin';
        const sql = isAdmin
            ? 'DELETE FROM reviews WHERE reviewID = ?'
            : 'DELETE FROM reviews WHERE reviewID = ? AND userID = ?';
        const params = isAdmin ? [reviewID] : [reviewID, userID];

        db.query(sql, params, function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Database error deleting review.' });
            }
            if (result.affectedRows === 0) {
                return res.status(403).json({ message: 'Review not found or unauthorized.' });
            }
            res.json({ message: 'Review deleted.' });
        });
    });
});

module.exports = router;