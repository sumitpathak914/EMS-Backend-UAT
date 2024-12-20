const Employee = require('../../Model/AuthModel/EMP_AuthModel');
const HR = require('../../Model/AuthModel/HR_AuthModel');
const Admin = require('../../Model/AuthModel/ADMIN_Authmodels');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
// Secret key for JWT
const SECRET_KEY = 'TechMET@#183';
// Register User
const registerUser = async (req, res) => {
    const { name, email, password, role, section, department, position, interview_Date, hiredDate, number } = req.body;

    // Validation checks
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    if (!password) return res.status(400).json({ message: 'Password is required.' });
    if (!role) return res.status(400).json({ message: 'Role is required.' });
    if (!section) return res.status(400).json({ message: 'Section is required.' });
    if (!department) return res.status(400).json({ message: 'Department is required.' });
    if (!position) return res.status(400).json({ message: 'Position is required.' });
    if (!interview_Date) return res.status(400).json({ message: 'Interview date is required.' });
    if (!hiredDate) return res.status(400).json({ message: 'Hired date is required.' });
    if (!number) return res.status(400).json({ message: 'Contact number is required.' });

    try {
        if (role === 'employee') {
            // Check if employee already exists
            const exists = await Employee.findOne({ email });
            if (exists) return res.status(400).json({ message: 'Employee already exists.' });

            // Generate the next incremental Employee ID
            const lastEmployee = await Employee.findOne().sort({ empID: -1 }); // Get the last employee by empID
            const nextEmpID = lastEmployee ? lastEmployee.empID + 1 : 1; // Increment or start at 1

            // Create new employee
            const newEmployee = await Employee.create({
                empID: nextEmpID,
                name,
                email,
                password,
                role,
                section,
                department,
                position,
                interview_Date,
                hiredDate,
                number,
                // image
            });

            return res.status(201).json({
                message: 'Employee registered successfully.',
                data: newEmployee,
            });
        } else {
            return res.status(400).json({ message: 'Invalid role.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
};


// Login User
// const loginUser = async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ message: 'Email and password are required.' });
//     }

//     try {
//         let user = null;
//         let role = null;

//         // Check each role's collection for the user
//         user = await Employee.findOne({ email });
//         if (user) role = 'employee';

//         if (!user) {
//             user = await HR.findOne({ email });
//             if (user) role = 'hr';
//         }

//         if (!user) {
//             user = await Admin.findOne({ email });
//             if (user) role = 'admin';
//         }

//         // If no user is found or password doesn't match
//         if (!user || user.password !== password) {
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         // Generate JWT Token without expiration
//         const token = jwt.sign(
//             { id: user._id, role, name: user.name },
//             SECRET_KEY
//         );

//         // Respond with token and user details
//         res.status(200).json({
//             statusCode:200,
//             message: 'Login successful.',
//             token,
//             data: { id: user._id, role, name: user.name }
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error.', error: error.message });
//     }
// };
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

        // Include additional details such as the image in the response
        const userData = {
            id: user._id,
            empID: user.empID,
            role,
            name: user.name,
            email: user.email,
            section: user.section,
            department: user.department,
            position: user.position,
            interview_Date: user.interview_Date,
            hiredDate: user.hiredDate,
            number: user.number,
            image: user.image, // Include image path or URL
        };

        // Respond with token and user details
        res.status(200).json({
            statusCode: 200,
            message: 'Login successful.',
            token,
            data: userData,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};


module.exports = { registerUser, loginUser };
