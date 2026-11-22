USE food_advisor;

INSERT INTO users (username, email, hashedPassword, role) VALUES
('chr123', 'chris@gmail.com', 'test_hash_chris', 'owner'),
('daw123', 'dawid@outlook.com', 'test_hash_dawid', 'owner'),
('arm123', 'armaan@icloud.com', 'test_hash_armaan', 'owner'),
('zak123', 'zak@gmail.com', 'test_hash_zak', 'customer'),
('kev123', 'kevin@hotmail.com', 'test_hash_kevin', 'customer'),
('admin', 'admin@outlook.com', 'test_hash_admin', 'admin');

INSERT INTO restaurants
(ownerID, restaurant_name, cuisine, location, openingHours, image_url)
VALUES
(
    (SELECT userID FROM users WHERE email = 'chris@gmail.com'),
    'ChrisEats',
    'Indian',
    'Edinburgh',
    '11am-9pm',
    'https://wallpapers.com/images/hd/traditional-thali-platter-indian-food-7ppdmw8bs4n1f36j.jpg'
),
(
    (SELECT userID FROM users WHERE email = 'dawid@outlook.com'),
    'PolishMeats',
    'Polish',
    'Dunfermlin',
    '10am-10pm',
    'https://zakladyboleslawiec.com/media/magefan_blog/PHOTO-2024-12-12-17-43-09.jpg'
),
(
    (SELECT userID FROM users WHERE email = 'armaan@icloud.com'),
    'Arab Street',
    'Arab',
    'Bruntsfield',
    '3-10pm',
    'https://wallpaperaccess.com/full/10008142.jpg'
);


USE food_advisor;

INSERT INTO reviews
(userID, restaurantID, rating, comment)
VALUES
(
    (SELECT userID FROM users WHERE email = 'kevin@hotmail.com'),
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'PolishMeats'),
    5,
    'Great food and incredible service!'
),
(
    (SELECT userID FROM users WHERE email = 'zak@gmail.com'),
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'ChrisEats'),
    4,
    'Really tasty, bit spicy though!'
),
(
    (SELECT userID FROM users WHERE email = 'kevin@hotmail.com'),
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'Arab Street'),
    5,
    'Delicious food, reminded me of home.'
),
(
    (SELECT userID FROM users WHERE email = 'zak@gmail.com'),
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'PolishMeats'),
    3,
    'Food was good, wont lie service was a bit slow tho.'
),
(
    (SELECT userID FROM users WHERE email = 'armaan@icloud.com'),
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'ChrisEats'),
    5,
    'Amazing indian food very authentic.'
),
(
    (SELECT userID FROM users WHERE email = 'chris@gmail.com'),
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'Arab Street'),
    4,
    'Service was great, food was good, would come again.'
);
