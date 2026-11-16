const selectedCuisine = cuisineFilter.value;
cards.forEach(function (card) {
     const cuisine = card.dataset.cuisine;
      if (selectedCuisine === "" || cuisine === selectedCuisine) { 
        card.style.display = "block";
     } 
     else { card.style.display = "none"; 
        
     } });