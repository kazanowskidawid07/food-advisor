const express = require('express');
const path = require('path'); // core path module
const cookieParser = require('cookie-parser'); // third party module for cookies

// import modular route files
const authRouter = require('./routes/auth');
const restaurantsRouter = require('./routes/restaurants');
const reviewsRouter = require('./routes/reviews');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = 3000;

// middleware
app.use(express.json()); // parse incoming JSON request bodies
app.use(cookieParser()); // parse cookies from incoming requests


// serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../public/html')));

// default home page route
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../public/html/home.html'));
});

// mount modular API routes
app.use('/api', authRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', adminRouter);


// start the server
app.listen(PORT, function () {
    console.log('Server running on port ' + PORT);
});