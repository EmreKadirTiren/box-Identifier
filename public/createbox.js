document.getElementById('createBoxForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const form = document.getElementById('createBoxForm'); // Get the form element
    const data = new FormData(form); // Create a FormData object from the form
    const jsonData = Object.fromEntries(data); // Convert the FormData object to a JavaScript object

    fetch('/create', {
        method: 'POST', // Send a POST request
        headers: {
            'Content-Type': 'application/json', // Tell the server we are sending JSON
        },
        body: JSON.stringify(jsonData), // Convert the JavaScript object to a JSON string
    })
    .then(response => response.text()) // Parse the response as text
    .then(result => alert(result)) // Show the response in an alert dialog
    .catch(error => alert('Error: ' + error)); // Show an error message in an alert dialog
});