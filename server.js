// Declaring the dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


dotenv.config(); // Load environment variables from .env file
const app = express();
const port = process.env.PORT || 3000; // Port number

mongoose.connect(process.env.MONGO_URI) // Connect to MongoDB
    .then(() => console.log('Connected to MongoDB')) // If the connection is successful
    .catch(err => console.error('Failed to connect to MongoDB', err)); // If the connection fails


//Creating a schema for the users so authenticated users can create boxes
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    boxes: [{
        boxId: String,
        password: String,
        boxName: String,
        boxCategory: String,
        boxContent: String,
    }],
    sharedBoxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Box' }], // Add an array of shared boxes
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});


//Creating a schema for the boxes so unauthenticated users can create boxes
const boxSchema = new mongoose.Schema({
    boxId: String,
    password: String,
    extraPasswords: [String], // Add an array of extra passwords
    category: String,
    content: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false}, //if there is a user id store it but it is not required
})

const User = mongoose.model('User', userSchema); // Create a model based on the userSchema
const Box = mongoose.model('Box', boxSchema); // Create a model based on the BoxSchema 

app.use(bodyParser.json()); // With this you can send JSON to the server and it transforms it into a JavaScript object
app.use(bodyParser.urlencoded({ extended: true })); // This allows you to send data from a form to the server
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(cors()); // Enable CORS

// API endpoint to register a new user
app.post('/register', async (req, res) => {
    const { username, name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// API endpoint to login a user
app.post('/login', async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// API endpoint to request a password reset
app.post('/forgot', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email }); // Find a user by their email
    if (!user) { // If the user does not exist
        return res.status(404).send('User not found'); // Send an error message
    }

    const token = crypto.randomBytes(20).toString('hex'); // Generate a random token
    user.resetPasswordToken = token; //Set token equel to the user's resetPasswordToken
    user.resetPasswordExpires = Date.now() + 3600000; // Set the token expiration time to 1 hour from now
    await user.save(); // Save the user to the database

    const transporter = nodemailer.createTransport({ // Create a nodemailer transporter
        service: 'zoho', // Change this to your email service if needed
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = { // Create the email
        to: user.email,
        from: process.env.EMAIL,
        subject: 'Password Reset Request',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/reset/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (error) => { // Send the email
        if (error) {
            return res.status(500).send('Error sending email: ' + error.message); // Send an error message
        }
        res.status(200).send('Email sent'); // Send a success message
    });
});

// API endpoint to reset a user's password when they click the link in the email
app.post('/reset', async (req, res) => {
    const { token } = req.params; // Get the token from the URL 
    const { password } = req.body; // Get the new password from the request body

    const user = await User.findOne({
        resetPasswordToken: token, // Find a user by their resetPasswordToken
        resetPasswordExpires: { $gt: Date.now() }, // Check if the token has not expired
    });

    if(!user){  // if resetpasswordtoken is not found or expired
        return res.status(400).send('Invalid or expired token, send a new  request'); // Send an error message
        }

        user.password = await bcrypt.hash(password, 10); // Hash the new password
        user.resetPasswordToken = undefined; // Remove the resetPasswordToken
        user.resetPasswordExpires = undefined; // Remove the resetPasswordExpires
        await user.save(); // Save the user to the database

        res.status(200).send('Password reset successfully'); // Send a success message
    })
    
 //TODO: Add API endpoints to delete boxes for Authenticated users and Unauthenticated users    

// API endpoints for authenticated users to create and find

// API endpoint to create a box for authenticated users
app.post('/create-auth', async (req, res) => {
    const { boxId, password, name, category, content } = req.body;
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).send('JWT must be provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send('JWT must be provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT token
        const userId = decoded.userId; // Get the user ID from the token
        const user = await User.findById(userId); // Find the user by ID

        if (!user) {
            return res.status(404).send('User not found');
        }

        const existingBox = user.boxes.find(box => box.boxId === boxId); // Check if the boxId already exists

        if (existingBox) {
            return res.status(400).send('Box already exists');
        }

        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10); // Hash the password if provided
        }

        const newBox = {
            boxId,
            password: hashedPassword,
            boxName: name,
            boxCategory: category,
            boxContent: content,
        };

        user.boxes.push(newBox); // Add the new box to the user's boxes array
        await user.save(); // Save the user to the database

        res.status(201).send('Box created successfully');
    } catch (error) {
        res.status(500).send('Error creating box: ' + error.message);
    }
});

// API endpoint to find a box for authenticated users
app.get('/find-auth', async (req, res) => {  // gets user-id and box-id from the request and returns the box
    const { boxId } = req.query;
    const authHeader = req.headers['authorization'];


    if(!authHeader){
        return res.status(401).send('JWT must be provided');
    }

    const token = authHeader.split(' ')[1];
    if(!token){
        return res.status(401).send('JWT must be provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT token
        const userId = decoded.userId; // Get the user ID from the token
        const user = await User.findById(userId); // Find the user by ID

        if (!user) {
            return res.status(404).send('User not found');
        }

        //Check if the box exists in the user's boxes array
        let box = user.boxes.find(box => box.boxId === boxId);

        if (!box) {
            box = user.sharedBoxes.find(box => box.boxId === boxId);
        }

        if(!box){ // if the box still does not exist
            return res.status(404).send('Box not found');
        }
        
        res.json({boxId: box.boxId, name: box.boxName, category: box.boxCategory, content: box.boxContent}); // Send the box data
        
    } catch (error) {
        res.status(500).send('Error finding box: ' + error.message);
        
    }
})
// API endpoint to find all boxes for authenticated users
app.get('/user-boxes', async (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).send('JWT must be provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send('JWT must be provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT token
        const userId = decoded.userId; // Get the user ID from the token
        const user = await User.findById(userId); // Find the user by ID

        if (!user) {
            return res.status(404).send('User not found');
        }

        const allBoxes = [ // Combine the user's boxes and sharedBoxes into one array
            ...user.boxes.map(box => ({ // Map over the user's boxes and return an object with the box data
                boxId: box.boxId,
                name: box.boxName,
                category: box.boxCategory,
                content: box.boxContent,
                isShared: false
            })),
            ...user.sharedBoxes.map(box => ({ // Map over the sharedBoxes and return an object with the box data
                boxId: box.boxId,
                name: box.boxName,
                category: box.boxCategory,
                content: box.boxContent,
                isShared: true
            }))
        ];
        res.json(allBoxes); // Send all boxes
    } catch (error) {
        res.status(500).send('Error finding boxes: ' + error.message);
    }
});


app.put('update-auth', async (req, res) => {
    const { boxId, oldPassword, newPassword, name, category, content, token } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT token
        const user = decoded.userId; // Get the user ID from the token
        const box = await Box.findOne({ boxId, userId: user }); // Find a box by its ID and user ID

        if(!box){ // If the box does not exist or the user does not have access to it
            return res.status(404).send('Box not found or you do not have access to it'); // Send an error message
        }

        // Update the box data
        if (oldPassword && newPassword){ // If the old password and new password are provided
            const isMatch = await bcrypt.compare(oldPassword, box.password); // Check if the old password is correct

            if(!isMatch){ // If the old password is incorrect
                return res.status(401).send('Old password is incorrect'); // Send an error message
            }
            box.password = await bcrypt.hash(newPassword, 10); // Hash the new password
        }
        if(name) { // If the name is provided
            box.name = name; // Set the box name
        }
        if(category) { // If the category is provided
            box.category = category; // Set the box category
        }
        if(content) { // If the content is provided
            box.content = content; // Set the box content
        }

        await box.save(); // Save the updated box to the database
        res.status(200).send('Box updated successfully'); // Send a success message
    } catch {
        res.status(500).send('Error updating box: ' + error.message); // Send an error message
    }
});

app.delete('/delete-auth', async (req, res) => {
    const { boxId, token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT token
        const user = decoded.userId; // Get the user ID from the token
        const box = await Box.findOneAndDelete({ boxId, userId: user }); // Find and delete a box by its ID and user ID

        if(!box){ // If the box does not exist or the user does not have access to it
            return res.status(404).send('Box not found or you do not have access to it'); // Send an error message
        }

        res.status(200).send('Box deleted successfully'); // Send a success message
    } catch (error) {
        res.status(500).send('Error deleting box: ' + error.message); // Send an error message
    }
});



// API endpoints for unauthenticated users to create and find boxes

// API endpoint to create a box
app.post('/create', async (req, res) => {
    const { boxId, password, name, category, content } = req.body;

    try {
        const existingBox = await Box.findOne({ boxId }) //Check if the boxId already exists
        if (existingBox) {
            return res.status(400).send('Box already exists');
        }

        const newBox = new Box({ boxId, password, name, category, content }); // Create a new box
        await newBox.save(); // Save the box to the database
        res.status(201).send('Box created successfully'); // Send a success message
    } catch (error) {
        res.status(500).send('Error creating box: ' + error.message); // Send an error message
    }
});

// API endpoint to get a box by its ID and password for unauthenticated users
app.get('/find', async (req, res) => {
    const { boxId, password } = req.query;

    try {
        const box = await Box.findOne({ boxId }); // Find a box by its ID
        if (!box) {
            return res.status(404).send('Box not found'); // Send an error message if the box is not found
        }

        const isPasswordMatch = await bcrypt.compare(password, box.password); // Check if the password matches the main password
        const isExtraPasswordMatch = await Promise.all(
            box.extraPasswords.map(async (hashedPassword) => await bcrypt.compare(password, hashedPassword))
        ).then(matches => matches.some(match => match)); // Check if the password matches any of the extra passwords

        if (!isPasswordMatch && !isExtraPasswordMatch) {
            return res.status(401).send('Invalid password'); // Send an error message if the password is invalid
        }

        res.json({
            name: box.boxName,
            category: box.boxCategory,
            content: box.boxContent,
        }); // Send the box details
    } catch (error) {
        res.status(500).send('Error finding box: ' + error.message); // Send an error message
    }
});

app.put('/update', async (req, res) => {
    const { boxId, oldPassword, newPassword, name, category, content } = req.body;

    try {
        const box = await Box.findOne({ boxId }); // Find a box by its ID
        const isMatch = await bcrypt.compare(oldPassword, box.password); // Check if the old password is correct
        
        if(!box || !isMatch) { // If the box does not exist or the password is incorrect
            return res.status(404).send('Box not found or old password is invalid'); // Send an error message
        }
        
        
        
        if(oldPassword && newPassword) { // If the old password and new password are provided
            box.password = await bcrypt.hash(newPassword, 10); // Hash the new password
        }
        
        if(name) { // If the name is provided
            box.name = name; // Set the box name
        }

        if(category) { // If the category is provided
            box.category = category; // Set the box category
        }

        if(content) { // If the content is provided
            box.content = content; // Set the box content
        }

        await box.save(); // Save the updated box to the database
        res.status(200).send('Box updated successfully'); // Send a success message
        
    } catch (error) {
        res.status(500).send('Error updating box: ' + error.message); // Send an
    }
});

app.delete('/delete', async (req, res) => {
    const { boxId, password } = req.query;

    try {
        const box = await Box.findOne({ boxId }); // Find a box by its ID
        
        if(!box || box.password !== password) { // If the box does not exist or the password is incorrect
            return res.status(404).send('Box not found or password is invalid'); // Send an error message
        }

        await Box.deleteOne({ boxId }); // Delete the box from the database
        res.status(200).send('Box deleted successfully from the database'); // Send a success message
    } catch(error) {
        res.status(500).send('Error deleting box: ' + error.message); // Send an error message
    }
})

// Share the box details with the user API
app.post('/share-box-unauth', async (req, res) => {
    const { boxId, boxPassword } = req.body;

    try {
        const box = await Box.findOne({ boxId });
        if (!box) {
            return res.status(404).json({ message: 'Box not found' });
        }

        const isPasswordMatch = await bcrypt.compare(boxPassword, box.password);
        const isExtraPasswordMatch = await Promise.all(
            box.extraPasswords.map(async (hashedPassword) => await bcrypt.compare(boxPassword, hashedPassword))
        ).then(matches => matches.some(match => match));

        if (!isPasswordMatch && !isExtraPasswordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({ boxId: box._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

//API's so sharetokens can be used to get the box details 
app.post('/validate-sharebox-unauth', async (req, res) => {
    const { token, newPassword } = req.body; // Get the token and newPassword from the request body

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT token
        const box = await Box.findOne({ boxId: decoded.boxId }); // Find the box by its ID

        if (!box) {
            return res.status(404).send('Box not found'); // Send an error message if the box is not found
        }

        const isPasswordMatch = await bcrypt.compare(newPassword, box.password); // Check if the new password matches the main password
        const isExtraPasswordMatch = await Promise.all(
            box.extraPasswords.map(async (hashedPassword) => await bcrypt.compare(newPassword, hashedPassword))
        ).then(matches => matches.some(match => match)); // Check if the new password matches any of the extra passwords

        if (!isPasswordMatch && !isExtraPasswordMatch) {
            return res.status(401).send('Invalid password'); // Send an error message if the password is invalid
        }

        res.json({
            name: box.boxName,
            category: box.boxCategory,
            content: box.boxContent,
        }); // Send the box details
    } catch (error) {
        res.status(500).send('Error validating share token: ' + error.message); // Send an error message
    }
});

app.listen(port, () => {  // Start the server
    console.log(`Server is running on port https://localhost:${port}`); // Tells where the server is running
});