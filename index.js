const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const path = require('path');
const Auth_Router = require('./src/Route/AuthRoute');
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(cors());
app.use('/Auth/api', Auth_Router);
app.get('/', (req, res) => {
    res.send('Server is running on http://localhost:' + PORT);
});
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected...");
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });