const Employee = require('../../Model/AuthModel/EMP_AuthModel'); // Import the Employee model

// Controller function to get all employees
const getAllEmployees = async (req, res) => {
    try {
        // Fetch all employee records from the Employee collection
        const employees = await Employee.find();

        if (employees.length === 0) {
            return res.status(404).json({ message: 'No employees found.' });
        }

        // Return the list of employees
        res.status(200).json({
            statusCode: 200,
            result:true,
            message: 'Employees fetched successfully.',
            data: employees,
        });
    } catch (error) {
        // Handle any errors during the fetching process
        res.status(500).json({
            message: 'Server error.',
            error: error.message,
        });
    }
};

module.exports = { getAllEmployees };
