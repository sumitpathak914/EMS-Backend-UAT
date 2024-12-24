const mongoose = require('mongoose');

const employeeDocumentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    empId: { type: String, required: true, unique: true }, // Store empId as a string (or ObjectId, depending on your needs)
    documents: [
        {
            documentType: { type: String, required: true },
            filePath: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now },
        }
    ],
});

module.exports = mongoose.model('EmployeeDocumentModel', employeeDocumentSchema);
