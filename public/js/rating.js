const stars = document.querySelectorAll(".star");
const ratingValue = document.getElementById("ratingValue");
const reviewText = document.getElementById("reviewText");
const submitButton = document.getElementById("submitReview");

const urlParams = new URLSearchParams(window.location.search);
const restaurantID = urlParams.get("id");

let rating = 0;

function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// star click events
stars.forEach(function (star, index) {
    star.addEventListener("click", function () {
        rating = index + 1;
        ratingValue.textContent = rating;
        updateStars();
    });
});

function updateStars() {
    stars.forEach(function (star, index) {
        star.textContent = index < rating ? "★" : "☆";
    });
}

// load live restaurant details, menu, and reviews from MySQL
async function loadRestaurantDetails() {
    if (!restaurantID) {
        document.getElementById("restaurant-info").innerHTML = "<h2>Restaurant not found</h2><p>Missing restaurant ID in URL.</p>";
        return;
    }

    try {
        const response = await fetch(`/api/restaurants/${encodeURIComponent(restaurantID)}`);
        if (!response.ok) {
            document.getElementById("restaurant-info").innerHTML = "<h2>Restaurant not found</h2>";
            return;
        }

        const data = await response.json();
        const r = data.restaurant;
        const menu = data.menu || [];
        const reviews = data.reviews || [];

        // calculate average rating from live reviews
        let avgText = "No ratings yet";
        if (reviews.length > 0) {
            const total = reviews.reduce((sum, rev) => sum + Number(rev.rating || 0), 0);
            const avg = (total / reviews.length).toFixed(1);
            avgText = `${avg}/5 (${reviews.length} review${reviews.length === 1 ? "" : "s"})`;
        }

        // 1. render restaurant info
        const infoSection = document.getElementById("restaurant-info");
        infoSection.innerHTML = `
            <h2>${escapeHTML(r.restaurant_name)}</h2>
            <p><strong>Cuisine:</strong> ${escapeHTML(r.cuisine || "Various")}</p>
            <p><strong>Location:</strong> ${escapeHTML(r.location || "Not specified")}</p>
            <p><strong>Opening Hours:</strong> ${escapeHTML(r.openingHours || "Not listed")}</p>
            <p><strong>Rating:</strong> ${escapeHTML(avgText)}</p>
        `;

        // 2. render live menu
        const menuSection = document.querySelector(".menu-section");
        if (menuSection) {
            if (menu.length === 0) {
                menuSection.innerHTML = `
                    <h2>Our Menu</h2>
                    <div class="menu-item"><p>No menu items listed yet.</p></div>
                `;
            } else {
                const itemsHTML = menu.map(item => `
                    <div class="menu-item">
                        <h3>${escapeHTML(item.itemName)}</h3>
                        <p>${escapeHTML(item.description || "")}</p>
                        <p>Price: £${Number(item.price).toFixed(2)}</p>
                    </div>
                `).join("");
                menuSection.innerHTML = `<h2>Our Menu</h2>${itemsHTML}`;
            }
        }

        // 3. render live customer reviews with reviewer username
        const reviewsContainer = document.getElementById("reviews-container");
        let reviewsHTML = `
            <p>Read some of the reviews left by other customers!</p>
            <hr>
        `;

        if (reviews.length === 0) {
            reviewsHTML += `<p id="noReviewsMessage">No reviews yet. Be the first to leave one!</p>`;
        } else {
            reviewsHTML += reviews.map(rev => {
                const starCount = Math.max(1, Math.min(5, parseInt(rev.rating, 10) || 1));
                const dateStr = rev.reviewDate ? new Date(rev.reviewDate).toLocaleDateString() : "";
                return `
                    <div class="review-card">
                        <h3>${"★".repeat(starCount)}${"☆".repeat(5 - starCount)} — ${escapeHTML(rev.username || "Customer")}</h3>
                        ${dateStr ? `<small>${escapeHTML(dateStr)}</small>` : ""}
                        <p>${escapeHTML(rev.comment || "")}</p>
                        <hr>
                    </div>
                `;
            }).join("");
        }

        reviewsContainer.innerHTML = reviewsHTML;
    } catch (error) {
        console.error("Error loading restaurant details:", error);
    }
}

// submit review to MySQL via POST /api/reviews
submitButton.addEventListener("click", async function () {
    const comment = reviewText.value.trim();

    if (rating === 0 || comment === "") {
        alert("Please select a star rating and enter a review.");
        return;
    }

    try {
        const response = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                restaurantID: parseInt(restaurantID, 10),
                rating: rating,
                comment: comment
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || data.error || "Could not submit review. Make sure you are logged in.");
            return;
        }

        // reset form and reload live reviews + average rating
        rating = 0;
        ratingValue.textContent = "0";
        updateStars();
        reviewText.value = "";
        await loadRestaurantDetails();
    } catch (error) {
        console.error("Error submitting review:", error);
        alert("Server error submitting review.");
    }
});

loadRestaurantDetails();