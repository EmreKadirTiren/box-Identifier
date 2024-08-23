# Box-Identifier

## Overview
Moving can be a hassle, especially when you have numerous boxes and can't remember what's inside each one. Box-Identifier is a web application designed to simplify your moving process. It generates a unique ID for each of your moving boxes, allowing you to label them efficiently. By entering the box ID and your password, you can easily retrieve the box name, category, and contents without having to open it.

## Road Map
### TODO:
- adding page(and api) so users can modify the boxes(Unauth [ ] AND Auth [ ])
- adding page(and api) so users can delete the boxes(Unauth [ ] AND Auth [ ])
- Adding page(and api) so users can change their profile (Auth users)
- Adding a feautre so users can share their boxes
- 2FA for auth users (maybe passkey)
- boxes to auth user can be exported in json and CSV
- Add languages
- MOBILE APP???
- QR codes that links to each box



### Done:
- Added a register api
- Added a login api
- Added a resetpasswordlinksender api
- Added a resetpassword api
- The createbox, and findbox api change so Authenticated and unauthenticated users can use it.
- Adding a deletebox api
- Adding a findallboxes connected to a user api 


## Setting Up and Troubleshooting

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

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

