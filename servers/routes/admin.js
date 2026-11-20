const express = require('express');
const router = express.Router();
const db = require('../db');

// middleware to verify the logged-in user is an admin
function requireAdmin(req, res, next) {
    const userID = req.cookies.userID;
    if (!userID) {
        return res.status(401).json({ message: 'You must be logged in.' });
    }

    db.query('SELECT userID, role FROM users WHERE userID = ?', [userID], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error verifying admin.' });
        }
        if (results.length === 0 || results[0].role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        req.adminID = results[0].userID;
        next();
    });
}

// GET /api/admin/dashboard - load all users, restaurants, reviews, and menu items
router.get('/dashboard', requireAdmin, function (req, res) {
    const usersSql = 'SELECT userID, username, email, role FROM users ORDER BY userID ASC';
    const restaurantsSql = `
        SELECT restaurants.*, COALESCE(NULLIF(users.username, ''), users.email) AS ownerName
        FROM restaurants
        JOIN users ON restaurants.ownerID = users.userID
        ORDER BY restaurants.restaurantID ASC
    `;
    const reviewsSql = `
        SELECT reviews.reviewID, reviews.rating, reviews.comment, reviews.reviewDate,
               COALESCE(NULLIF(users.username, ''), users.email) AS username,
               restaurants.restaurant_name
        FROM reviews
        JOIN users ON reviews.userID = users.userID
        JOIN restaurants ON reviews.restaurantID = restaurants.restaurantID
        ORDER BY reviews.reviewDate DESC, reviews.reviewID DESC
    `;
    const menusSql = `
        SELECT menuItems.menuItemID, menuItems.itemName, menuItems.description, menuItems.price,
               restaurants.restaurant_name
        FROM menuItems
        JOIN restaurants ON menuItems.restaurantID = restaurants.restaurantID
        ORDER BY restaurants.restaurant_name ASC, menuItems.itemName ASC
    `;

    db.query(usersSql, function (err, users) {
        if (err) return res.status(500).json({ message: 'Error loading users.' });

        db.query(restaurantsSql, function (err, restaurants) {
            if (err) return res.status(500).json({ message: 'Error loading restaurants.' });

            db.query(reviewsSql, function (err, reviews) {
                if (err) return res.status(500).json({ message: 'Error loading reviews.' });

                db.query(menusSql, function (err, menus) {
                    if (err) return res.status(500).json({ message: 'Error loading menu items.' });

                    res.json({ users, restaurants, reviews, menus });
                });
            });
        });
    });
});

// DELETE /api/admin/users/:id - delete a user account (cannot delete yourself)
router.delete('/users/:id', requireAdmin, function (req, res) {
    const targetUserID = parseInt(req.params.id, 10);
    if (isNaN(targetUserID)) {
        return res.status(400).json({ message: 'Invalid user ID.' });
    }
    if (targetUserID === req.adminID) {
        return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    db.query('DELETE FROM users WHERE userID = ?', [targetUserID], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error deleting user.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ message: 'User deleted successfully.' });
    });
});

// DELETE /api/admin/restaurants/:id - delete any restaurant
router.delete('/restaurants/:id', requireAdmin, function (req, res) {
    const restaurantID = parseInt(req.params.id, 10);
    if (isNaN(restaurantID)) {
        return res.status(400).json({ message: 'Invalid restaurant ID.' });
    }

    db.query('DELETE FROM restaurants WHERE restaurantID = ?', [restaurantID], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error deleting restaurant.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Restaurant not found.' });
        }
        res.json({ message: 'Restaurant deleted successfully.' });
    });
});

// DELETE /api/admin/reviews/:id - delete any review
router.delete('/reviews/:id', requireAdmin, function (req, res) {
    const reviewID = parseInt(req.params.id, 10);
    if (isNaN(reviewID)) {
        return res.status(400).json({ message: 'Invalid review ID.' });
    }

    db.query('DELETE FROM reviews WHERE reviewID = ?', [reviewID], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error deleting review.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Review not found.' });
        }
        res.json({ message: 'Review deleted successfully.' });
    });
});

// DELETE /api/admin/menus/:id - delete any menu item
router.delete('/menus/:id', requireAdmin, function (req, res) {
    const menuItemID = parseInt(req.params.id, 10);
    if (isNaN(menuItemID)) {
        return res.status(400).json({ message: 'Invalid menu item ID.' });
    }

    db.query('DELETE FROM menuItems WHERE menuItemID = ?', [menuItemID], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error deleting menu item.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Menu item not found.' });
        }
        res.json({ message: 'Menu item deleted successfully.' });
    });
});

module.exports = router;