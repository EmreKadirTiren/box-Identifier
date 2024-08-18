document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
    }
});

document.getElementById('createBoxAuthForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = document.getElementById('createBoxAuthForm');
    const data = new FormData(form);
    const jsonData = Object.fromEntries(data);

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found in localStorage');
        alert('You must be logged in to create a box.');
        return;
    }

    console.log('Token:', token); // Debugging: Log the token

    fetch('http://localhost:3000/create-auth', { // Ensure the URL is correct
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        },
        body: JSON.stringify(jsonData),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.text();
    })
    .then(result => {
        console.log('Box created successfully:', result); // Debugging: Log the success message
        alert(result);
    })
    .catch(error => {
        console.error('Error creating box:', error); // Debugging: Log the error
        alert('Error creating box: ' + error.message);
    });
});