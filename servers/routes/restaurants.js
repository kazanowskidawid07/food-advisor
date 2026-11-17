const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/restaurants - fetch all restaurants (with optional ?cuisine= filter)
router.get('/', function(req, res) {
    let sql = 'SELECT * FROM restaurants';
    let params = [];

    if (req.query.cuisine) {
        sql += ' WHERE cuisine = ?';
        params.push(req.query.cuisine);
    }

    db.query(sql, params, function(err, results) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error fetching restaurants' });
        }
        res.json(results); // returns rows as JSON
    });
});

// GET /api/restaurants/:id - fetch a single restaurant + its menu + its reviews
router.get('/:id', function(req, res) {
    const restaurantID = req.params.id;

    db.query('SELECT * FROM restaurants WHERE restaurantID = ?', [restaurantID], function(err, restaurantResults) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (restaurantResults.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        db.query('SELECT * FROM menuItems WHERE restaurantID = ?', [restaurantID], function(err, menuResults) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error fetching menu' });
            }

            // JOIN with users to include reviewer username
            const reviewSql = `
                SELECT reviews.reviewID, reviews.rating, reviews.comment, reviews.reviewDate, users.username 
                FROM reviews 
                JOIN users ON reviews.userID = users.userID 
                WHERE reviews.restaurantID = ? 
                ORDER BY reviews.reviewDate DESC
            `;
            db.query(reviewSql, [restaurantID], function(err, reviewResults) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database error fetching reviews' });
                }

                res.json({
                    restaurant: restaurantResults[0],
                    menu: menuResults,
                    reviews: reviewResults
                });
            });
        });
    });
});

module.exports = router;