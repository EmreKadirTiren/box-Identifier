// Declaring the dependencies
const express = require('express');
const mongose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');


dotenv.config(); // Load environment variables from .env file
const app = express();
const port = process.env.PORT || 3000; // Port number

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }); // Connect to MongoDB
// Telling the database how to tore the data
const boxSchema = new mongoose.Schema({
    boxId: Number,
    password: String,
    name: String,
    category: {type: stringify, default: 'Uncategorized'},
    content: String,
});

const Box = mongoose.model('Box', boxSchema); // Create a model based on the schema

app.use(bodyParser.json()); // With this you can send JSON to the server and it transforms it into a JavaScript object
app.use(bodyParser.urlencoded({ extended: true })); // This allows you to send data from a form to the server





app.post('/create', async (req, res) => {
    const boxId = Math.floor(Math.random() * 1000000); // Generate a random number between 0 and 999999
    const {password, name, category, content } = req.body;

    try {
        const existingBox = await Box.findOne({ boxId }) //Check if the boxId already exists
        if (existingBox) {
            return res.status(400).send('Box already exists');
        }

        const newBox = new Box({ boxId, password, name, category, content }); // Create a new box
        await newBox.save(); // Save the box to the database
        res.status(201).send('Box created successfully'); // Send a success message
    }
    catch (error) {
        res.status(500).send('Error creating box: ' + error.message); // Send an error message
    }
});





app.listen(port, () => {  // Start the server
    console.log(`Server is running on port https://localhost:${port}`); // Tells where the server is running
});