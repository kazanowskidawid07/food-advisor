const stars = document.querySelectorAll(".star");
const ratingValue = document.getElementById("ratingValue");
const reviewText = document.getElementById("reviewText");
const submitButton = document.getElementById("submitReview");

// Determine which restaurant page we are on
const restaurantName =
    document.querySelector(
        "#restaurant-info h2"
    ).textContent;

// Create a storage key from the restaurant name
const storageKey =
    restaurantName.replaceAll(" ", "") + "Reviews";



let rating = 0;


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
submitButton.addEventListener("click", function () {

    const review = reviewText.value;

    if (rating === 0 || review === "") {

        alert("Please enter a rating and review.");

        return;
    }

    const reviewObject = {
    rating: rating,
    comment: review
};



let reviews =
    JSON.parse(
        localStorage.getItem(storageKey)
    ) || [];

    reviews.push(reviewObject);

    localStorage.setItem(
    storageKey,
    JSON.stringify(reviews)
);

    

    addReviewToPage(rating, review);

    reviewText.value = "";

});

function addReviewToPage(rating, review) {

const reviewsContainer =
document.getElementById("reviews-container");

const noReviewsMessage =
document.getElementById("noReviewsMessage");

if (noReviewsMessage) {
noReviewsMessage.remove();
}
const reviewCard =
document.createElement("div");

reviewCard.classList.add("review-card");

reviewCard.innerHTML =

"<h3>" + "★".repeat(rating) + "</h3>" +

"<p>" + review + "</p>";

reviewsContainer.appendChild(reviewCard);
}

function loadReviews()
{
const savedReviews =
JSON.parse(
localStorage.getItem(
storageKey
)
) || [];

savedReviews.forEach(function(review)
{
addReviewToPage(
review.rating,
review.comment
);
});
}

loadReviews();