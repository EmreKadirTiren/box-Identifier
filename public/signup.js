document.getElementById('signup-form').addEventListener('submit', async (e) => { // listens when the form is submitted and when it is, it will run the thing beteween the curly braces
    event.preventDefault(); // prevents the default action of the form which is to refresh the page

    const username = document.getElementById('username').value; // gets the value of the username input
    const name = document.getElementById('name').value; // gets the value of the name input
    const email = document.getElementById('email').value; // gets the value of the email input
    const password = document.getElementById('password').value; // gets the value of the password input
    try{ // tries to run the code between the curly braces
    const response = await fetch('/register', { // sends a POST request to the /register route
        method: 'POST', // specifies the method of the request
        headers: { 'Content-Type': 'application/json' }, // specifies the content type of the request
        body: JSON.stringify({ username, name, email, password }) // sends the username, name, email, and password as JSON
    });
    if (response.ok){ // if the response is okay
        message.textContent = 'Account created successfully!'; // sets the text content of the message element to 'Account created successfully!'
        message.style.color = 'green'; // sets the color of the message element to green
    }
    } catch (error) { // if there is an error
        message.textContent = `An error occurred: ${error}`; // sets the text content of the message element to 'An error occurred. Please try again later.'
        message.style.color = 'red'; // sets the color of the message element to red
    }
});