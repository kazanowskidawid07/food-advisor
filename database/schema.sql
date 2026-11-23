USE food_advisor;

CREATE TABLE users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashedPassword VARCHAR(255) NOT NULL,
    role ENUM('customer', 'owner', 'admin') NOT NULL DEFAULT 'customer'
);

CREATE TABLE restaurants (
    restaurantID INT AUTO_INCREMENT PRIMARY KEY,
    ownerID INT NOT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    cuisine VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    openingHours VARCHAR(255),
    dietary VARCHAR(100),
    image_url VARCHAR(500) DEFAULT NULL,
    FOREIGN KEY (ownerID) REFERENCES users(userID) ON DELETE CASCADE
);

CREATE TABLE menuItems (
    menuItemID INT AUTO_INCREMENT PRIMARY KEY,
    restaurantID INT NOT NULL,
    itemName VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (restaurantID) REFERENCES restaurants(restaurantID) ON DELETE CASCADE
); 

CREATE TABLE reviews (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    restaurantID INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    reviewDate DATE NOT NULL DEFAULT (CURRENT_DATE),
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
    FOREIGN KEY (restaurantID) REFERENCES restaurants(restaurantID) ON DELETE CASCADE
);

