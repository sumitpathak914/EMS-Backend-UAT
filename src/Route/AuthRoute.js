const express = require('express');
const { registerUser, loginUser } = require('../Controller/Auth/Auth_controller');
const { upload } = require('../multerConfig/multer_Config'); // Ensure the upload middleware is imported correctly


const Auth_Router = express.Router();

// Register API
Auth_Router.post('/register', upload.single('image'), registerUser);

// Login API
Auth_Router.post('/login', loginUser);

module.exports = Auth_Router;
