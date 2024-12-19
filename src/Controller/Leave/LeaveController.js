const LeaveApplicationModel = require('../../Model/LeaveManagementModel/LeaveManagmentmodel');
const mongoose = require("mongoose");

exports.applyForLeave = async (req, res) => {
    try {
        const { empId, name, leaveType, startDate, endDate, description } = req.body;

        // Validate required fields
        if (!empId || !leaveType || !startDate || !endDate || !description) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create a new leave application object
        const newLeaveApplication = {
            leaveType,
            startDate,
            endDate,
            description,
            status: 'Pending',
            leaveApplyDate: new Date(),
        };

        // Find an existing employee document by empId
        let employee = await LeaveApplicationModel.findOne({ empId: empId });

        if (employee) {
            // If the employee already exists, push the new leave application into the leaveApplications array
            employee.leaveApplications.push(newLeaveApplication);

            // Save the updated employee document
            await employee.save();

            return res.status(200).json({ message: 'Leave application added successfully', data: employee });
        } else {
            // If the employee does not exist, create a new document
            const newEmployee = new LeaveApplicationModel({
                empId,
                name,
                leaveApplications: [newLeaveApplication]
            });

            // Save the new employee document
            await newEmployee.save();

            return res.status(201).json({ message: 'Leave application submitted successfully', data: newEmployee });
        }
    } catch (error) {
        console.error('Error details:', error); // Log the complete error object
        res.status(500).json({ message: 'Error submitting leave application', error: error.message });
    }
};
exports.getEmployeeData = async (req, res) => {
    try {
        const { empId } = req.params;

        // Validate empId
        if (!empId) {
            return res.status(400).json({ message: 'Employee ID is required' });
        }

        // Find the employee document by empId
        const employee = await LeaveApplicationModel.findOne({ empId: empId });

        if (!employee) {
            return res.status(404).json({ statusCode: 404, result: false, message: 'Employee not found', data: [] });
        }

        // Respond with the employee data
        return res.status(200).json({ statusCode: 200, result: true, message: 'Employee data fetched successfully', data: employee });
    } catch (error) {
        console.error('Error fetching employee data:', error); // Log the complete error object
        res.status(500).json({ message: 'Error fetching employee data', error: error.message });
    }
};
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, leaveId, empId } = req.body;
       

        // Validate inputs
        if (!leaveId || !empId) {
            return res.status(400).json({ message: 'Employee ID and Leave ID are required' });
        }

        const validStatuses = ['Approved', 'Rejected', 'Cancel', 'Pending'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` });
        }

        // Validate leaveId format
        if (!mongoose.Types.ObjectId.isValid(leaveId)) {
            return res.status(400).json({ message: 'Invalid Leave ID format' });
        }

        // Find and update the leave application in the nested array
        const result = await LeaveApplicationModel.findOneAndUpdate(
            {
                empId: empId, // Match the employee ID
                'leaveApplications._id': leaveId, // Match the nested leave ID
            },
            {
                $set: { 'leaveApplications.$.status': status }, // Update the status of the matched leave application
            },
            { new: true } // Return the updated document
        );

        if (!result) {
            return res.status(404).json({ statusCode: 404, result: false, message: 'Leave application not found', data: [] });
        }

        // Respond with success
        return res.status(200).json({
            statusCode: 200,
            result: true,
            message: `Leave status updated to ${status} successfully`,
            data: result,
        });
    } catch (error) {
        console.error('Error updating leave status:', error); // Log the complete error object
        res.status(500).json({ message: 'Error updating leave status', error: error.message });
    }
};

