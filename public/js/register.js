
const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async function(event) {

    // prevents the page from refreshing
    event.preventDefault();

    // recieve the data entered by user
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {

        // send registration details to the Node.js backend
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        // retrieve response from the backend
        const data = await response.json();

        // check if registration was successful
        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert(data.message);

        // clear the registration form
        registerForm.reset();

    } catch (error) {

        console.log(error);
        alert('Unable to connect to the server. Please try again.');

    }

});

