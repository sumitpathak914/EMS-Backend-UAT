const express = require('express');
const { registerUser, loginUser } = require('../Controller/Auth/Auth_controller');
const { upload } = require('../multerConfig/multer_Config'); 
const { getCurrentWifiSSID } = require('../Controller/Auth/Wifi_Controller');


const Auth_Router = express.Router();

// Register API
// Auth_Router.post('/register', upload.single('image'), registerUser);
Auth_Router.post('/register',  registerUser);

// Login API
Auth_Router.post('/login', loginUser);
Auth_Router.get('/current-ssid', getCurrentWifiSSID);

module.exports = Auth_Router;
