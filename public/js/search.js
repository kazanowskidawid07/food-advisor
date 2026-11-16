// Get the cuisine dropdown from the page
const cuisineFilter = document.getElementById("cuisineFilter");

// Get the search bar from the page
const searchBar = document.getElementById("restaurantSearch");

// Get all restaurant cards
const cards = document.querySelectorAll(".restaurant-card");

const priceFilter = document.getElementById("priceFilter");

// Get the dietary filter dropdown
const dietaryFilter = document.getElementById("dietaryFilter");

// Get the location filter dropdown
const locationFilter = document.getElementById("locationFilter");

/*
    This function runs whenever:
    - the user changes the cuisine filter
    - the user types into the search bar

    It decides which restaurant cards should be shown.
*/


function filterRestaurants() {

    // Get the selected cuisine from the dropdown
    const selectedCuisine = cuisineFilter.value;

    //Get chosen price
    const selectedPrice = priceFilter.value;

    // Get selected dietary preference
    const selectedDietary = dietaryFilter.value;

// Get selected location
    const selectedLocation = locationFilter.value;

    // Convert search text to lowercase
    // so search is not case-sensitive
    const searchText = searchBar.value.toLowerCase();

    // Loop through every restaurant card
    cards.forEach(function(card) {

        // Read the cuisine stored in data-cuisine
        const cuisine = card.dataset.cuisine;

        const price = card.dataset.price;

        // Read location stored in data-location
        const location = card.dataset.location;

// Read dietary information stored in data-dietary
        const dietary = card.dataset.dietary;

        // Get the restaurant name from the h3 tag
        const restaurantName =
            card.querySelector("h3").textContent.toLowerCase();

        /*
            Check if cuisine matches.

            Examples:
            selectedCuisine = "italian"
            cuisine = "italian"
            -> true

            selectedCuisine = ""
            -> true because "All cuisines" is selected
        */
        const matchesCuisine =
            selectedCuisine === "" ||
            cuisine === selectedCuisine;

        /*
            Check if the restaurant name contains
            the text entered in the search bar.

            Example:
            searchText = "ita"

            restaurantName = "italian restaurant"

            Result = true
        */

        const matchesPrice = 
        selectedPrice === "" || price === selectedPrice
        const matchesSearch =
            restaurantName.includes(searchText);

            // Check if location matches
        const matchesLocation =
            selectedLocation === "" ||
            location === selectedLocation;

        // Check if dietary preference matches
        const matchesDietary =
            selectedDietary === "" ||
            dietary === selectedDietary;

        /*
            Only show restaurants that pass BOTH tests.
        */
        if (matchesCuisine && matchesSearch && matchesPrice && matchesDietary && matchesLocation) {

            // Show card
            card.style.display = "block";

        }
        else {

            // Hide card
            card.style.display = "none";

        }

    });

}

/*
    Run filterRestaurants whenever the
    cuisine selection changes.
*/
cuisineFilter.addEventListener(
    "change",
    filterRestaurants
);

priceFilter.addEventListener("change", filterRestaurants);

locationFilter.addEventListener("change", filterRestaurants);

dietaryFilter.addEventListener("change", filterRestaurants);

/*
    Run filterRestaurants whenever the
    user types in the search bar.
*/
searchBar.addEventListener(
    "input",
    filterRestaurants
);