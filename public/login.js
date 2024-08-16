document.getElementById('signin-form').addEventListener('submit', async (e) => { // listens when the form is submitted and when it is, it will run the thing beteween the curly braces
    event.preventDefault(); // prevents the default action of the form which is to refresh the page

    const usernameOrEmail = document.getElementById('usernameOrEmail').value; // gets the value of the username input
    const password = document.getElementById('password').value; // gets the value of the password input
    try{ // tries to run the code between the curly braces
    const response = await fetch('/login', { // sends a POST request to the /register route
        method: 'POST', // specifies the method of the request
        headers: { 'Content-Type': 'application/json' }, // specifies the content type of the request
        body: JSON.stringify({ usernameOrEmail, password }) // sends the username, name, email, and password as JSON
    });
    if (response.ok){ // if the response is okay
        message.textContent = `Signing in. You will be redirected shortly`; // sets the text content of the message element to 'Account created successfully!'
        message.style.color = 'green'; // sets the color of the message element to green
    }
    } catch (error) { // if there is an error
        message.textContent = `An error occurred: ${error}`; // sets the text content of the message element to 'An error occurred. Please try again later.'
        message.style.color = 'red'; // sets the color of the message element to red
    }
});