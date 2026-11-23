const restaurantSelect = document.getElementById('restaurantSelect');
const restaurantForm = document.getElementById('restaurantForm');
const menuForm = document.getElementById('menuForm');
const menuList = document.getElementById('menuList');
const reviewsList = document.getElementById('reviewsList');

let myRestaurants = [];

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// load all restaurants owned by the logged-in user
async function loadOwnerRestaurants(selectIdAfterLoad = null) {
    try {
        const response = await fetch('/api/restaurants/owner/mine');
        if (response.status === 401) {
            alert('Please log in as a restaurant owner.');
            window.location.href = 'login.html';
            return;
        }
        if (response.status === 403) {
            alert('Access denied. Only restaurant owners can access this page.');
            window.location.href = 'home.html';
            return;
        }

        myRestaurants = await response.json();

        restaurantSelect.innerHTML = '<option value="new">+ Add New Restaurant</option>';
        myRestaurants.forEach(r => {
            const option = document.createElement('option');
            option.value = r.restaurantID;
            option.textContent = `${r.restaurant_name} (${r.location})`;
            restaurantSelect.appendChild(option);
        });

        if (selectIdAfterLoad) {
            restaurantSelect.value = selectIdAfterLoad;
        } else if (myRestaurants.length > 0) {
            restaurantSelect.value = myRestaurants[0].restaurantID;
        }

        handleRestaurantSelection();
    } catch (error) {
        console.error(error);
    }
}

// fill forms, menu items, and reviews when a restaurant is chosen
async function handleRestaurantSelection() {
    const selectedId = restaurantSelect.value;

    if (selectedId === 'new') {
        restaurantForm.reset();
        menuList.innerHTML = '<p>Save your new restaurant first to add menu items.</p>';
        reviewsList.innerHTML = '<p>No reviews yet.</p>';
        return;
    }

    const current = myRestaurants.find(r => String(r.restaurantID) === String(selectedId));
    if (current) {
        document.getElementById('restaurantName').value = current.restaurant_name || '';
        document.getElementById('cuisine').value = current.cuisine || '';
        document.getElementById('location').value = current.location || '';
        document.getElementById('openingHours').value = current.openingHours || '';
        const dietaryInput = document.getElementById('dietary');
        if (dietaryInput) {
            dietaryInput.value = current.dietary || '';
        }
        const imageInput = document.getElementById('imageUrl');
        if (imageInput) {
            imageInput.value = current.image_url || '';
        }
    }

    try {
        const response = await fetch(`/api/restaurants/${selectedId}`);
        const data = await response.json();

        // render current menu with delete buttons
        if (!data.menu || data.menu.length === 0) {
            menuList.innerHTML = '<p>No menu items yet. Add one using the form!</p>';
        } else {
            menuList.innerHTML = data.menu.map(item => `
                <div style="border-bottom: 1px solid #ddd; padding: 8px 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${escapeHTML(item.itemName)}</strong> — £${Number(item.price).toFixed(2)}<br>
                        <small>${escapeHTML(item.description || '')}</small>
                    </div>
                    <button type="button" class="view-button" onclick="deleteMenuItem(${item.menuItemID})">Delete</button>
                </div>
            `).join('');
        }

        // render customer reviews (read-only)
        if (!data.reviews || data.reviews.length === 0) {
            reviewsList.innerHTML = '<p>No customer reviews yet.</p>';
        } else {
            reviewsList.innerHTML = data.reviews.map(rev => `
                <div style="border-bottom: 1px solid #ddd; padding: 8px 0;">
                    <strong>${escapeHTML(rev.username)}</strong> — ${rev.rating}/5 ⭐<br>
                    <p style="margin: 4px 0;">${escapeHTML(rev.comment || '')}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error(error);
    }
}

restaurantSelect.addEventListener('change', handleRestaurantSelection);

// create or edit restaurant
restaurantForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const selectedId = restaurantSelect.value;
    const dietaryInput = document.getElementById('dietary');
    const imageInput = document.getElementById('imageUrl');

    const payload = {
        restaurant_name: document.getElementById('restaurantName').value.trim(),
        cuisine: document.getElementById('cuisine').value.trim(),
        location: document.getElementById('location').value.trim(),
        openingHours: document.getElementById('openingHours').value.trim(),
        dietary: dietaryInput ? dietaryInput.value.trim() : '',
        image_url: imageInput ? imageInput.value.trim() : ''
    };

    const isNew = selectedId === 'new';
    const url = isNew ? '/api/restaurants' : `/api/restaurants/${selectedId}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            const idToSelect = isNew ? data.restaurantID : selectedId;
            await loadOwnerRestaurants(idToSelect);
        }
    } catch (error) {
        console.error(error);
        alert('Error saving restaurant.');
    }
});

// add menu item
menuForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const selectedId = restaurantSelect.value;
    if (selectedId === 'new') {
        alert('Please select or create a restaurant first.');
        return;
    }

    const payload = {
        itemName: document.getElementById('itemName').value.trim(),
        description: document.getElementById('description').value.trim(),
        price: parseFloat(document.getElementById('price').value)
    };

    try {
        const response = await fetch(`/api/restaurants/${selectedId}/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            menuForm.reset();
            handleRestaurantSelection();
        }
    } catch (error) {
        console.error(error);
        alert('Error adding menu item.');
    }
});

// delete menu item
async function deleteMenuItem(itemId) {
    if (!confirm('Delete this menu item?')) return;

    try {
        const response = await fetch(`/api/restaurants/menu/${itemId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            handleRestaurantSelection();
        }
    } catch (error) {
        console.error(error);
    }
}

loadOwnerRestaurants();