const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const Auth_Router = require('./src/Route/AuthRoute'); // Adjust path based on structure

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/Auth/api', Auth_Router);
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Database connection (Make sure this runs only once per function execution)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.error("MongoDB connection error:", err));

module.exports = app; // Export the app for Vercel to handle
