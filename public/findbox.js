document.getElementById('findBoxForm').addEventListener('submit', function(event) { // Add an event listener to the form
    event.preventDefault(); // Prevent the default form submission

    const boxId = document.getElementById('boxID').value; // Get the box ID from the input field
    const password = document.getElementById('password').value; // Get the password from the input field

    fetch(`/find?boxId=${boxId}&password=${password}`) // Send a request with ID and password so it can be checked and the box details can be returned
        .then(response => {
            if (response.status === 404) {  // if the box is not found, return error 404
                throw new Error('Box not found');
            } else if (response.status === 401) { // if the password is wrong, return error 401
                throw new Error('Wrong password');
            }
            return response.json(); //If nothing is wrong, return the response as JSON
        })
        .then(data => { // Display the box details
            document.getElementById('boxDetails').innerHTML = // Display the box details
            `   <h2>Box Details</h2>
                <p><strong>Box Id:</strong> ${boxId}</p>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Category:</strong> ${data.category}</p>
                <p><strong>Content:</strong> ${data.content}</p>
            `;
        })
        .catch(error => alert('Error: ' + error.message)); // Show an error message in an alert dialog
});