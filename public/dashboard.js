document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token'); // Get the token from local storage


    if (!token) { // If there is no token
        window.location.href = '/login.html'; // Redirect to the login page
        return; // Stop the function
    }

    try {
        const response = await fetch('/find-auth', { // Send a GET request to the /find-auth endpoint
            headers: { Authorization: `Bearer ${token}` } // Set the Authorization header with the token
        });

        if (response.ok) { // If the response is okay
            const boxes = await response.json(); // Parse the response as JSON
            const boxesList = document.getElementById('boxes-list'); // Get the boxes-list element

            boxes.forEach(box => { // Iterate over each box
                const listItem = document.createElement('li'); // Create a new list item
                listItem.textContent = `${box.boxId} - ${box.boxName} - ${box.boxCategory} - ${box.boxContent}`; // Set the text content of the list item
                boxesList.appendChild(listItem); // Append the list item to the boxes-list element
            });
        } else {
            console.log('Invalid token or failed response'); // Debugging line
            window.location.href = '/login.html'; // Redirect to the login page if the token is invalid
        }
    } catch (error) { // If there is an error
        console.error('Error fetching boxes: ', error); // Log the error to the console
        setTimeout(() => {
            window.location.href = '/login.html'; // Redirect to the login page after a delay
        }, 1000);
    }
});