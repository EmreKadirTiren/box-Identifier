// When the page is loaded, check if there is a token in the local storage. If not, redirect to the login page.
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // Check if there is a token in the local storage

    if (!token) {
        window.location.href = '/login.html'; // If not, redirect to the login page
        return;
    }

    // Add an event listener for the submit event on the find-box-form
    const form = document.getElementById('find-box-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const boxId = document.getElementById('box-id').value; // Get the value of the box-id input

        try {
            const response = await fetch(`/find-auth?boxId=${boxId}`, { // Send a GET request to the /find-auth endpoint with the boxId as a query parameter
                headers: { Authorization: `Bearer ${token}` } // Set the Authorization header with the token
            });

            if (response.ok) { // If the response is okay
                const box = await response.json(); // Parse the response as JSON
                displayBoxDetails(box); // Display the box details
            } else {
                console.log('Invalid token or failed response'); // Debugging line
                window.location.href = '/login.html'; // Redirect to the login page if the token is invalid
            }
        } catch (error) { // If there is an error
            console.error('Error fetching box: ', error); // Log the error to the console
            setTimeout(() => {
                window.location.href = '/login.html'; // Redirect to the login page after a delay
            }, 1000);
        }
    });
});

// Function to display the box details
function displayBoxDetails(box) {
    const boxDetails = document.getElementById('box-details'); // Get the box-details element
    boxDetails.innerHTML = `
        <h3>Box Details</h3>
        <p><strong>Box ID:</strong> ${box.boxId}</p>
        <p><strong>Name:</strong> ${box.name}</p>
        <p><strong>Category:</strong> ${box.category}</p>
        <p><strong>Content:</strong> ${box.content}</p>
    `; // Set the inner HTML of the box-details element
}