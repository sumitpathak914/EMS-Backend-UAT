const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    date: { type: String, required: true },
    punch_in_time: { type: String },
    punch_out_time: { type: String },
    punch_in: { type: Boolean, default: false },
    wifi_ip: { type: String },
    status: { type: String } // New field for attendance status
});

const attendanceSchema = new mongoose.Schema({
    emp_id: { type: String, required: true },
    records: [attendanceRecordSchema]
});

module.exports = mongoose.model('Attendance', attendanceSchema);
