document.addEventListener('DOMContentLoaded', async () => { // listens when the page is loaded and when it is, it will run the thing beteween the curly braces
    const token = localStorage.getItem('token'); // gets the token from the local storage that was set when the user logged in
    if (!token) { // if there is no token
        window.location.href = '/login.html'; // redirects the user to the login page because they are not logged in so there are no tokens
        return; // stops the function	
    }

    try{
        const response = await fetch('/user-boxes', { // sends a GET request to the /user-boxes API
            headers: { Authorization: `Bearer ${token}` } // sets the Authorization header as the token
            
        });
        if (response.ok){ // if the response is okay
            const boxes = await response.json(); // sets boxes = response of the API sent as JSON
            const boxesList = document.getElementById('boxes-list'); // gets the boxes-list element
            boxes.forEach(box => {
                const listItem = document.createElement('li'); // creates a new list item
                listItem.textContent = `${box.boxId} - ${box.boxName} - ${box.boxCategory} - ${box.Content}`; // sets the text content of the list item to the boxId and name of the box
                boxesList.appendChild(listItem); // appends the list item to the boxes-list element
            });
            }
            else{
                window.location.href = '/login.html'; // redirects the user to the login page because the token is invalid
            }
        } catch (error) { // if there is an error
            console.error('Error fetching boxes: ', error); // logs the error to the console
            setTimeout(() => {
                window.location.href = '/login.html'; // redirects the user to the login page because there was an error
            })
            
    }


});