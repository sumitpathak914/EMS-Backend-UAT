const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'employee' },
    section: { type: String },
    department: { type: String },
    position: { type: String },
    interview_Date: { type: Date },
    hiredDate: { type: Date },
    number: { type: String },
    image: { type: String }, // Path to the uploaded file
});

module.exports = mongoose.model('Employee', employeeSchema);
