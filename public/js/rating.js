const stars =
    document.querySelectorAll(".star");

const ratingValue =
    document.getElementById("ratingValue");

let rating = 0;

stars.forEach(function(star, index)
{
    star.addEventListener("click", function()
        {
            rating = index + 1;

            ratingValue.textContent =
                rating;

            updateStars();
        }
    );
});

function updateStars()
{
    stars.forEach(function(star, index)
    {
        if (index < rating)
        {
            star.textContent = "★";
        }
        else
        {
            star.textContent = "☆";
        }
    });
}