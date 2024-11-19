const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    emp_id: {
        type: String,
        required: true,
    },
    date: {
        type: String, // Consider storing it in "YYYY-MM-DD" format for easy comparison
        required: true,
    },
    punch_in_time: {
        type: String, // Store time in "HH:mm:ss" format
        required: false,
    },
    punch_out_time: {
        type: String, // Store time in "HH:mm:ss" format
        required: false,
    },
    punch_in: {
        type: Boolean,
        required: true,
        default: false, // False by default since the employee is not punched in initially
    },
    punch_out: {
        type: Boolean,
        required: false,
        default: false,
    },
    wifi_ip: {
        type: String,
        required: true,
    },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
