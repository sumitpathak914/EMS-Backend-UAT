const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
    leaveType: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'Pending',
    },
    approveMessage: {
        type: String,
        default: '',
    },
    disapproveMessage: {
        type: String,
        default: '',
    },
    leaveApplyDate: {
        type: Date,
        default: Date.now,
    },
});

const LeaveApplicationData = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    empId: {
        type: String,
        unique: true,
        required: true,
    },
    leaveApplications: [leaveApplicationSchema], // Array to store leave applications
    // Other employee fields...
});

module.exports = mongoose.model('LeaveApplicationData', LeaveApplicationData);
