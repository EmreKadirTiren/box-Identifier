# Box-Identifier

## TODO:
- The createbox, and findbox api change so Authenticated and unauthenticated users can use it.
- Adding a deletebox api
- Adding a findallboxes connected to a user api 

## Done:
- Added a register api
- Added a login api
- Added a resetpasswordlinksender api
- Added a resetpassword api

## Overview
Moving can be a hassle, especially when you have numerous boxes and can't remember what's inside each one. Box-Identifier is a web application designed to simplify your moving process. It generates a unique ID for each of your moving boxes, allowing you to label them efficiently. By entering the box ID and your password, you can easily retrieve the box name, category, and contents without having to open it.

### Configuration
Create a `.env` file in the root directory and add the following:
    ```properties
    PORT="3000"
    MONGO_URI="your_mongodb_connection_string"
    EMAIL="your email"
    EMAIL_PASSWORD="your email password"
    ```

    change line 84 on server.js to your prefered email provided if it is suported by nodemailer.

### **Responses**:
    - `201 Created`: Box created successfully.
    - `400 Bad Request`: Box already exists.
    - [`500 Internal Server Error`]("Go to definition"): Error creating box.

### Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

