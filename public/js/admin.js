const usersList = document.getElementById('usersList');
const restaurantsList = document.getElementById('restaurantsList');
const reviewsList = document.getElementById('reviewsList');
const menusList = document.getElementById('menusList');
const userSearchInput = document.getElementById('userSearch');
const searchUsersBtn = document.getElementById('searchUsersBtn');
const adminMenuRestaurantSelect = document.getElementById('adminMenuRestaurantSelect');

let allUsers = [];
let allMenus = [];

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderUsers(users) {
    if (!users || users.length === 0) {
        usersList.innerHTML = '<p>No matching user accounts found.</p>';
        return;
    }

    usersList.innerHTML = users.map(u => `
        <div style="border-bottom: 1px solid #ddd; padding: 8px 0; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div style="text-align: left;">
                <strong>${escapeHTML(u.username)}</strong> (${escapeHTML(u.role)})<br>
                <small>${escapeHTML(u.email)}</small>
            </div>
            ${u.role !== 'admin'
                ? `<button type="button" class="view-button" onclick="deleteUser(${u.userID})">Delete</button>`
                : `<small><em>Admin</em></small>`}
        </div>
    `).join('');
}

function filterUsers() {
    const query = (userSearchInput.value || '').trim().toLowerCase();
    if (!query) {
        renderUsers(allUsers);
        return;
    }
    const filtered = allUsers.filter(u =>
        (u.username && u.username.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query))
    );
    renderUsers(filtered);
}

function renderFilteredMenus() {
    const selectedRestaurant = adminMenuRestaurantSelect ? adminMenuRestaurantSelect.value : 'all';

    const filteredMenus = selectedRestaurant === 'all'
        ? allMenus
        : allMenus.filter(m => m.restaurant_name === selectedRestaurant);

    if (!filteredMenus || filteredMenus.length === 0) {
        menusList.innerHTML = '<p>No menu items found for this restaurant.</p>';
        return;
    }

    menusList.innerHTML = filteredMenus.map(m => `
        <div style="border-bottom: 1px solid #ddd; padding: 8px 0; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div style="text-align: left;">
                <strong>${escapeHTML(m.itemName)}</strong> — £${Number(m.price).toFixed(2)}<br>
                <small>${escapeHTML(m.restaurant_name)}${m.description ? ': ' + escapeHTML(m.description) : ''}</small>
            </div>
            <button type="button" class="view-button" onclick="deleteMenu(${m.menuItemID})">Delete</button>
        </div>
    `).join('');
}

async function loadAdminDashboard() {
    try {
        const response = await fetch('/api/admin/dashboard');
        if (response.status === 401 || response.status === 403) {
            alert('Admin access required. Please log in with an admin account.');
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();

        // 1. Users
        allUsers = data.users || [];
        filterUsers();

        // 2. Restaurants
        const restaurants = data.restaurants || [];
        if (restaurants.length === 0) {
            restaurantsList.innerHTML = '<p>No restaurants found.</p>';
        } else {
            restaurantsList.innerHTML = restaurants.map(r => `
                <div style="border-bottom: 1px solid #ddd; padding: 8px 0; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                    <div style="text-align: left;">
                        <strong>${escapeHTML(r.restaurant_name)}</strong> (${escapeHTML(r.cuisine || 'Various')})<br>
                        <small>${escapeHTML(r.location)} • Owner: ${escapeHTML(r.ownerName)}</small>
                    </div>
                    <button type="button" class="view-button" onclick="deleteRestaurant(${r.restaurantID})">Delete</button>
                </div>
            `).join('');
        }

        // 3. Reviews
        const reviews = data.reviews || [];
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p>No customer reviews found.</p>';
        } else {
            reviewsList.innerHTML = reviews.map(rev => `
                <div style="border-bottom: 1px solid #ddd; padding: 8px 0; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                    <div style="text-align: left;">
                        <strong>${escapeHTML(rev.restaurant_name)}</strong> — ${rev.rating}/5 ⭐ by ${escapeHTML(rev.username)}<br>
                        <small>${escapeHTML(rev.comment || '')}</small>
                    </div>
                    <button type="button" class="view-button" onclick="deleteReview(${rev.reviewID})">Delete</button>
                </div>
            `).join('');
        }

        // 4. Menus & Restaurant Dropdown
        allMenus = data.menus || [];
        if (adminMenuRestaurantSelect) {
            const previousSelection = adminMenuRestaurantSelect.value || 'all';
            adminMenuRestaurantSelect.innerHTML = '<option value="all">All Restaurants</option>';
            restaurants.forEach(r => {
                const option = document.createElement('option');
                option.value = r.restaurant_name;
                option.textContent = r.restaurant_name;
                adminMenuRestaurantSelect.appendChild(option);
            });
            // Keep the previously chosen restaurant selected if it still exists
            const stillExists = Array.from(adminMenuRestaurantSelect.options).some(opt => opt.value === previousSelection);
            adminMenuRestaurantSelect.value = stillExists ? previousSelection : 'all';
        }
        renderFilteredMenus();
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }
}

async function deleteUser(userID) {
    if (!confirm('Delete this user account and all their associated data?')) return;
    const res = await fetch(`/api/admin/users/${userID}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    if (res.ok) loadAdminDashboard();
}

async function deleteRestaurant(restaurantID) {
    if (!confirm('Delete this restaurant and its menu/reviews?')) return;
    const res = await fetch(`/api/admin/restaurants/${restaurantID}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    if (res.ok) loadAdminDashboard();
}

async function deleteReview(reviewID) {
    if (!confirm('Remove this customer review?')) return;
    const res = await fetch(`/api/admin/reviews/${reviewID}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    if (res.ok) loadAdminDashboard();
}

async function deleteMenu(menuItemID) {
    if (!confirm('Delete this menu item?')) return;
    const res = await fetch(`/api/admin/menus/${menuItemID}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    if (res.ok) loadAdminDashboard();
}

if (searchUsersBtn) searchUsersBtn.addEventListener('click', filterUsers);
if (userSearchInput) userSearchInput.addEventListener('input', filterUsers);
if (adminMenuRestaurantSelect) adminMenuRestaurantSelect.addEventListener('change', renderFilteredMenus);

loadAdminDashboard();