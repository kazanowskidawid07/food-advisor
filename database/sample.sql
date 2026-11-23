USE food_advisor;

/* place holder accounts, restaurants and reviews*/
INSERT INTO users (username, email, hashedPassword, role) VALUES
('chr123', 'chris@gmail.com', 'notrealpassword1', 'owner'),
('daw123', 'dawid@outlook.com', 'notrealpassword2', 'owner'),
('arm123', 'armaan@icloud.com', 'notrealpassword3', 'owner'),
('zak123', 'zak@gmail.com', 'notrealpassword4', 'customer'),
('kev123', 'kevin@hotmail.com', 'notrealpassword5', 'customer');

/*setting an admin after registering an account*/
/* UPDATE users SET role="admin" WHERE email="youremail";*/

/*setting an owner after registering an account*/
/* UPDATE users SET role="owner" WHERE email="youremail";*/

INSERT INTO restaurants
(ownerID, restaurant_name, cuisine, location, openingHours,dietary, image_url)
VALUES
(
    (SELECT userID FROM users WHERE email = 'chris@gmail.com'),
    'ChrisEats',
    'Indian',
    'Edinburgh',
    '11am-9pm',
    'Vegan',
    'https://wallpapers.com/images/hd/traditional-thali-platter-indian-food-7ppdmw8bs4n1f36j.jpg'
),
(
    (SELECT userID FROM users WHERE email = 'dawid@outlook.com'),
    'PolishMeats',
    'Polish',
    'Dunfermlin',
    '10am-10pm',
    'Gluten-Free',
    'https://zakladyboleslawiec.com/media/magefan_blog/PHOTO-2024-12-12-17-43-09.jpg'
),
(
    (SELECT userID FROM users WHERE email = 'armaan@icloud.com'),
    'Arab Street',
    'Arab',
    'Bruntsfield',
    '3-10pm',
    'Halal',
    'https://wallpaperaccess.com/full/10008142.jpg'
);

INSERT INTO menuItems (restaurantID, itemName, description, price)
VALUES
(
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'ChrisEats'),
    'Chicken Biryani',
    'Tender, savory chicken bursting with flavour in delicious rice.',
    12.50
),
(
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'ChrisEats'),
    'Lamb Biryani',
    'Tender, savory lamb bursting with flavour in delicious rice.',
    10.00
),
(
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'PolishMeats'),
    'Pierogi',
    'Polish dumplings boiled to perfection.',
    9.50
),
(
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'PolishMeats'),
    'Zurek',
    'Tangy soup, served with poatoes and egg',
    11.00
),
(
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'Arab Street'),
    'Chicken Shawarma',
    'Marinated chicken complimented with delicious sauces and fresh vegetables.',
    10.50
),
(
    (SELECT restaurantID FROM restaurants WHERE restaurant_name = 'Arab Street'),
    'Falafel Wrap',
    'Crispy falafel with fresh vegetables and special sauce',
    8.50
);

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
