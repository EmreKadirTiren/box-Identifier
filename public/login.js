document.getElementById('signin-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const usernameOrEmail = document.getElementById('usernameOrEmail').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: usernameOrEmail, password })
        });

        if (response.ok) {
            const data = await response.json();
            message.textContent = `Signing in. You will be redirected shortly`;
            message.style.color = 'green';

            localStorage.setItem('token', data.token); // Store the token in localStorage
            window.location.href = '/createbox-auth.html';
        } else {
            const errorData = await response.json();
            message.textContent = `Login failed: ${errorData.message}`;
            message.style.color = 'red';
        }
    } catch (error) {
        message.textContent = `An error occurred: ${error}`;
        message.style.color = 'red';
    }
});