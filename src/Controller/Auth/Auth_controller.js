const Employee = require('../../Model/AuthModel/EMP_AuthModel');
const HR = require('../../Model/AuthModel/HR_AuthModel');
const Admin = require('../../Model/AuthModel/ADMIN_Authmodels');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
// Secret key for JWT
const SECRET_KEY = 'TechMET@#183';
// Register User
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {

        if (role === 'employee') {
            const exists = await Employee.findOne({ email });
            if (exists) return res.status(400).json({ message: 'Employee already exists.' });

            const newEmployee = await Employee.create({ name, email, password });
            return res.status(201).json({ message: 'Employee registered successfully.', data: newEmployee });
        } else {
            return res.status(400).json({ message: 'Invalid role.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        let user = null;
        let role = null;

        // Check each role's collection for the user
        user = await Employee.findOne({ email });
        if (user) role = 'employee';

        if (!user) {
            user = await HR.findOne({ email });
            if (user) role = 'hr';
        }

        if (!user) {
            user = await Admin.findOne({ email });
            if (user) role = 'admin';
        }

        // If no user is found or password doesn't match
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT Token without expiration
        const token = jwt.sign(
            { id: user._id, role, name: user.name },
            SECRET_KEY
        );

        // Respond with token and user details
        res.status(200).json({
            statusCode:200,
            message: 'Login successful.',
            token,
            data: { id: user._id, role, name: user.name }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

module.exports = { registerUser, loginUser };
