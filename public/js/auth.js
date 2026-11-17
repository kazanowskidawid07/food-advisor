const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async function (event) {
        // prevents page from refreshing
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            // save basic user info so frontend pages know who is logged in
            localStorage.setItem('user', JSON.stringify(data.user));

            alert(data.message);

            // redirect based on role
            if (data.user.role === 'admin') {
                window.location.href = 'admin-page.html';
            } else if (data.user.role === 'owner') {
                window.location.href = 'owner-page.html';
            } else {
                window.location.href = 'home.html';
            }
        } catch (error) {
            console.log(error);
            alert('Unable to connect to the server. Please try again.');
        }
    });
}

// update the navigation bar based on whether a user is logged in
function updateNavbar() {
    const nav = document.querySelector('header nav');
    const storedUser = localStorage.getItem('user');

    if (!nav || !storedUser) {
        return; // not logged in - leave login and register links as they are
    }

    const user = JSON.parse(storedUser);

    // build role specific dashboard link if applicable
    let dashboardLink = '';
    if (user.role === 'admin') {
        dashboardLink = '<a href="admin-page.html">Admin</a>';
    } else if (user.role === 'owner') {
        dashboardLink = '<a href="owner-page.html">My Restaurant</a>';
    }

    nav.innerHTML = `
        <a href="home.html">Home</a>
        <a href="restaurants-page.html">Restaurants</a>
        ${dashboardLink}
        <a href="#" id="logoutBtn">Logout (${user.username})</a>
    `;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function (event) {
            event.preventDefault();

            try {
                await fetch('/api/logout', { method: 'POST' });
            } catch (error) {
                console.log(error);
            }

            localStorage.removeItem('user');
            alert('Logged out successfully.');
            window.location.href = 'home.html';
        });
    }
}

updateNavbar();