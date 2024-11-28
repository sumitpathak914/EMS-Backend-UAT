const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    todayDate: {
        type: Date,
        required: true
    },
    details: [
        {
            srNo: Number,
            projectName: String,
            moduleName: String,
            description: String,
            estimatedHr: String,
            workingHr: String,
            startDate: Date,
            endDate: Date,
            status: String
        }
    ]
});

const workReportSchema = new mongoose.Schema({
    emp_id: {
        type: Number,
        required: true,
        ref: 'Employee' // Optional: Link to an Employee model if you have one
    },
    reports: [reportSchema] // Array of grouped reports by date
}, { timestamps: true });

module.exports = mongoose.model('WorkReport', workReportSchema);
