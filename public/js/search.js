// Get filter elements and container from the page
const cuisineFilter = document.getElementById("cuisineFilter");
const searchBar = document.getElementById("restaurantSearch");
const priceFilter = document.getElementById("priceFilter");
const dietaryFilter = document.getElementById("dietaryFilter");
const locationFilter = document.getElementById("locationFilter");
const restaurantContainer = document.querySelector(".restaurant-container");

function getPriceTier(avgPrice) {
    if (avgPrice === null || avgPrice === undefined) return "";
    const price = Number(avgPrice);
    if (price < 10) return "budget";
    if (price <= 20) return "moderate";
    return "expensive";
}

// Escape user-generated text to prevent XSS
function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Pick custom image_url first, then fallback by cuisine, or return blank if none
function getRestaurantImage(restaurant) {
    if (restaurant.image_url && restaurant.image_url.trim() !== "") {
        return restaurant.image_url.trim();
    }
    const c = (restaurant.cuisine || "").toLowerCase();
    if (c.includes("indian")) return "../images/indian-food.jpg";
    if (c.includes("italian")) return "../images/italian-food.jpg";
    if (c.includes("chinese") || c.includes("japanese")) return "../images/chinese-food.jpg";
    return "";
}

// Dynamically populate Cuisine and Location dropdowns from live database rows
function populateFilterOptions(restaurants) {
    if (cuisineFilter) {
        const cuisines = [...new Set(
            restaurants.map(r => (r.cuisine || "").trim()).filter(Boolean)
        )].sort();

        cuisineFilter.innerHTML = '<option value="">All cuisines</option>' +
            cuisines.map(c => `<option value="${escapeHTML(c.toLowerCase())}">${escapeHTML(c)}</option>`).join("");
    }

    if (locationFilter) {
        const locations = [...new Set(
            restaurants.map(r => (r.location || "").trim()).filter(Boolean)
        )].sort();

        locationFilter.innerHTML = '<option value="">All locations</option>' +
            locations.map(loc => `<option value="${escapeHTML(loc.toLowerCase())}">${escapeHTML(loc)}</option>`).join("");
    }
}

// Render restaurant cards into .restaurant-container
function renderRestaurants(restaurants) {
    if (!restaurantContainer) return;

    if (!restaurants || restaurants.length === 0) {
        restaurantContainer.innerHTML = "<p>No restaurants available.</p>";
        return;
    }

    restaurantContainer.innerHTML = restaurants.map(r => {
        const safeName = escapeHTML(r.restaurant_name);
        const safeCuisine = escapeHTML(r.cuisine || "Various");
        const safeLocation = escapeHTML(r.location || "");
        const safeHours = escapeHTML(r.openingHours || "Hours not listed");
        const safeDietary = escapeHTML(r.dietary || "Standard");
        const priceTier = getPriceTier(r.avgPrice);
        const priceLabel = priceTier ? priceTier.charAt(0).toUpperCase() + priceTier.slice(1) : "Not listed";
        const imgSrc = getRestaurantImage(r);
        const imgHTML = imgSrc ? `<img src="${escapeHTML(imgSrc)}" alt="${safeCuisine} cuisine">` : "";

        return `
            <div class="restaurant-card"
                 data-cuisine="${escapeHTML((r.cuisine || "").toLowerCase())}"
                 data-location="${escapeHTML((r.location || "").toLowerCase())}"
                 data-price="${escapeHTML(priceTier)}"
                 data-dietary="${escapeHTML((r.dietary || "").toLowerCase())}">
                ${imgHTML}
                <h3>${safeName}</h3>
                <p>Cuisine: ${safeCuisine}</p>
                <p>Location: ${safeLocation}</p>
                <p>Price Range: ${priceLabel}</p>
                <p>Dietary: ${safeDietary}</p>
                <p>Hours: ${safeHours}</p>
                <a href="restaurant-details.html?id=${encodeURIComponent(r.restaurantID)}" class="view-button">View Restaurant</a>
            </div>
        `;
    }).join("");
}

// Filter dynamically rendered cards whenever a dropdown or search input changes
function filterRestaurants() {
    const selectedCuisine = cuisineFilter ? cuisineFilter.value.toLowerCase() : "";
    const selectedPrice = priceFilter ? priceFilter.value.toLowerCase() : "";
    const selectedDietary = dietaryFilter ? dietaryFilter.value.toLowerCase() : "";
    const selectedLocation = locationFilter ? locationFilter.value.toLowerCase() : "";
    const searchText = searchBar ? searchBar.value.toLowerCase() : "";

    const cards = document.querySelectorAll(".restaurant-card");

    cards.forEach(function(card) {
        const cuisine = (card.dataset.cuisine || "").toLowerCase();
        const price = (card.dataset.price || "").toLowerCase();
        const location = (card.dataset.location || "").toLowerCase();
        const dietary = (card.dataset.dietary || "").toLowerCase();
        const restaurantName = card.querySelector("h3").textContent.toLowerCase();

        const matchesCuisine = selectedCuisine === "" || cuisine === selectedCuisine;
        const matchesPrice = selectedPrice === "" || price === selectedPrice;
        const matchesLocation = selectedLocation === "" || location === selectedLocation;
        const matchesDietary = selectedDietary === "" || dietary.includes(selectedDietary);
        const matchesSearch = restaurantName.includes(searchText) || cuisine.includes(searchText) || location.includes(searchText);

        if (matchesCuisine && matchesSearch && matchesPrice && matchesDietary && matchesLocation) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// Fetch live restaurants from the backend API on page load
async function loadRestaurants() {
    try {
        const response = await fetch("/api/restaurants");
        if (!response.ok) {
            throw new Error("Failed to fetch restaurants");
        }
        const restaurants = await response.json();
        populateFilterOptions(restaurants);
        renderRestaurants(restaurants);
    } catch (error) {
        console.error(error);
        if (restaurantContainer) {
            restaurantContainer.innerHTML = "<p>Error loading restaurants. Please try again later.</p>";
        }
    }
}

// Attach event listeners
if (cuisineFilter) cuisineFilter.addEventListener("change", filterRestaurants);
if (priceFilter) priceFilter.addEventListener("change", filterRestaurants);
if (locationFilter) locationFilter.addEventListener("change", filterRestaurants);
if (dietaryFilter) dietaryFilter.addEventListener("change", filterRestaurants);
if (searchBar) searchBar.addEventListener("input", filterRestaurants);

// Initialize page
loadRestaurants();