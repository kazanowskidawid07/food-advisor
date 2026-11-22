const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to validate image_url (allows empty, local ../images/ paths, or http/https URLs)
function isValidImageUrl(url) {
    if (!url || url.trim() === '') return true;
    const trimmed = url.trim();
    if (trimmed.includes('<') || trimmed.includes('>') || trimmed.includes('"') || trimmed.includes("'")) {
        return false;
    }
    return trimmed.startsWith('../images/') || trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

// GET /api/restaurants - fetch all restaurants + average menu price
router.get('/', function(req, res) {
    let sql = `
        SELECT restaurants.*, ROUND(AVG(menuItems.price), 2) AS avgPrice
        FROM restaurants
        LEFT JOIN menuItems ON restaurants.restaurantID = menuItems.restaurantID
        WHERE 1=1
    `;
    let params = [];

    if (req.query.cuisine) {
        sql += ' AND restaurants.cuisine LIKE ?';
        params.push('%' + req.query.cuisine + '%');
    }

    if (req.query.location) {
        sql += ' AND restaurants.location LIKE ?';
        params.push('%' + req.query.location + '%');
    }

    sql += ' GROUP BY restaurants.restaurantID';

    db.query(sql, params, function(err, results) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error fetching restaurants' });
        }
        res.json(results);
    });
});

// GET /api/restaurants/owner/mine - fetch restaurants owned by the logged-in user
router.get('/owner/mine', function(req, res) {
    const userID = req.cookies.userID;
    if (!userID) {
        return res.status(401).json({ message: 'You must be logged in.' });
    }

    db.query('SELECT * FROM restaurants WHERE ownerID = ?', [userID], function(err, results) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error fetching your restaurants' });
        }
        res.json(results);
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

            const reviewSql = `
                SELECT reviews.reviewID, reviews.rating, reviews.comment, reviews.reviewDate, 
                       COALESCE(NULLIF(users.username, ''), users.email) AS username 
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

// POST /api/restaurants - create a new restaurant for the logged-in owner
router.post('/', function(req, res) {
    const userID = req.cookies.userID;
    if (!userID) {
        return res.status(401).json({ message: 'You must be logged in.' });
    }

    const { restaurant_name, cuisine, location, openingHours, image_url, dietary } = req.body;

    if (!restaurant_name || !location) {
        return res.status(400).json({ message: 'Restaurant name and location are required.' });
    }

    if (!isValidImageUrl(image_url)) {
        return res.status(400).json({ message: 'Invalid image URL format.' });
    }

    const sql = 'INSERT INTO restaurants (ownerID, restaurant_name, cuisine, location, openingHours, image_url, dietary) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [
        userID,
        restaurant_name.trim(),
        (cuisine || '').trim(),
        location.trim(),
        (openingHours || '').trim(),
        (image_url || '').trim(),
        (dietary || '').trim()
    ];

    db.query(sql, params, function(err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error creating restaurant.' });
        }

        res.status(201).json({
            message: 'Restaurant created successfully!',
            restaurantID: result.insertId
        });
    });
});

// PUT /api/restaurants/:id - update an existing restaurant owned by the logged-in user
router.put('/:id', function(req, res) {
    const userID = req.cookies.userID;
    const restaurantID = req.params.id;

    if (!userID) {
        return res.status(401).json({ message: 'You must be logged in.' });
    }

    const { restaurant_name, cuisine, location, openingHours, image_url, dietary } = req.body;

    if (!restaurant_name || !location) {
        return res.status(400).json({ message: 'Restaurant name and location are required.' });
    }

    if (!isValidImageUrl(image_url)) {
        return res.status(400).json({ message: 'Invalid image URL format.' });
    }

    const sql = 'UPDATE restaurants SET restaurant_name = ?, cuisine = ?, location = ?, openingHours = ?, image_url = ?, dietary = ? WHERE restaurantID = ? AND ownerID = ?';
    const params = [
        restaurant_name.trim(),
        (cuisine || '').trim(),
        location.trim(),
        (openingHours || '').trim(),
        (image_url || '').trim(),
        (dietary || '').trim(),
        restaurantID,
        userID
    ];

    db.query(sql, params, function(err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error updating restaurant.' });
        }

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Restaurant not found or unauthorized.' });
        }

        res.json({ message: 'Restaurant updated successfully!' });
    });
});

// POST /api/restaurants/:id/menu - add a menu item to an owned restaurant
router.post('/:id/menu', function(req, res) {
    const userID = req.cookies.userID;
    const restaurantID = req.params.id;

    if (!userID) {
        return res.status(401).json({ message: 'You must be logged in.' });
    }

    const { itemName, description, price } = req.body;

    if (!itemName || price === undefined) {
        return res.status(400).json({ message: 'Item name and price are required.' });
    }

    db.query('SELECT restaurantID FROM restaurants WHERE restaurantID = ? AND ownerID = ?', [restaurantID, userID], function(err, ownedResults) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error verifying ownership.' });
        }

        if (ownedResults.length === 0) {
            return res.status(403).json({ message: 'You do not own this restaurant.' });
        }

        const insertSql = 'INSERT INTO menuItems (restaurantID, itemName, description, price) VALUES (?, ?, ?, ?)';
        db.query(insertSql, [restaurantID, itemName, description || '', price], function(err, result) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Database error adding menu item.' });
            }

            res.status(201).json({
                message: 'Menu item added!',
                menuItemID: result.insertId
            });
        });
    });
});

// DELETE /api/restaurants/menu/:itemId - delete a menu item from an owned restaurant
router.delete('/menu/:itemId', function(req, res) {
    const userID = req.cookies.userID;
    const itemId = req.params.itemId;

    if (!userID) {
        return res.status(401).json({ message: 'You must be logged in.' });
    }

    const sql = `
        DELETE menuItems FROM menuItems
        JOIN restaurants ON menuItems.restaurantID = restaurants.restaurantID
        WHERE menuItems.menuItemID = ? AND restaurants.ownerID = ?
    `;

    db.query(sql, [itemId, userID], function(err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error deleting menu item.' });
        }

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Menu item not found or unauthorized.' });
        }

        res.json({ message: 'Menu item deleted.' });
    });
});

module.exports = router;