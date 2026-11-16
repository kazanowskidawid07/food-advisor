const stars = document.querySelectorAll(".star");
const ratingValue = document.getElementById("ratingValue");
const reviewText = document.getElementById("reviewText");
const submitButton = document.getElementById("submitReview");

let rating = 0;

// Load saved rating
const savedRating = localStorage.getItem("rating");
const savedReview = localStorage.getItem("review");

if (savedRating) {
    rating = Number(savedRating);
    ratingValue.textContent = rating;
    updateStars();
}

if (savedReview) {
    reviewText.value = savedReview;
}

// Star click events
stars.forEach(function(star, index) {

    star.addEventListener("click", function() {

        rating = index + 1;

        ratingValue.textContent = rating;

        localStorage.setItem(
            "rating",
            rating
        );

        updateStars();

    });

});

function updateStars() {

    stars.forEach(function(star, index) {

        if (index < rating) {
            star.textContent = "★";
        }
        else {
            star.textContent = "☆";
        }

    });

}

// Submit review
submitButton.addEventListener("click", function() {

    const review = reviewText.value;

    localStorage.setItem(
        "review",
        review
    );

    console.log("Rating:", rating);
    console.log("Review:", review);

    alert("Review saved!");

});