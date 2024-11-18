const express = require('express');
const { registerUser, loginUser } = require('../Controller/Auth/Auth_controller');

const Auth_Router = express.Router();

// Register API
Auth_Router.post('/register', registerUser);

// Login API
Auth_Router.post('/login', loginUser);

module.exports = Auth_Router;
