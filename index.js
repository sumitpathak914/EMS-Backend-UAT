const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const Auth_Router = require('./src/Route/AuthRoute'); // Adjust path based on structure
const Emp_router = require('./src/Route/Employe_Route');

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/Auth/api', Auth_Router);
app.use('/api/Emp', Emp_router);
app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Database connection (Make sure this runs only once per function execution)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.error("MongoDB connection error:", err));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
module.exports = app; // Export the app for Vercel to handle
