const mongoose = require('mongoose');
const EmployeeDocumentData = require('../../Model/Document/DocumentModel');
const EmployeeData = require('../../Model/AuthModel/EMP_AuthModel');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where files will be uploaded
    },
    filename: (req, file, cb) => {
        // File name with a timestamp to prevent collisions
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Filter to allow only specific file types (optional)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
};

// Multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter, // Optional: Add file type validation
    limits: { fileSize: 10 * 1024 * 1024 } // Optional: Max file size limit (10 MB)
});


exports.addDocument = [
    upload.single('document'),
    async (req, res) => {
        const { empId, documentType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            // Find the existing employee by empId
            const employeeCheck = await EmployeeData.findOne({ empID: empId });

            if (!employeeCheck) {
                return res.status(404).json({ message: 'Employee not found' });
            }
            let employeeDocument = await EmployeeDocumentData.findOne({ empId });

            // Ensure the documents field is an array, even if it is undefined or null
            if (!employeeDocument) {
                // If no document record exists for this employee, create a new entry
                employeeDocument = new EmployeeDocumentData({
                    empId,
                    name: employeeCheck.name, // Store employee name
                    email: employeeCheck.email, // Store employee email
                    documents: [] // Initialize the documents array
                });
            }

            // Prepare the document object to be added
            const document = {
                documentType,
                filePath: req.file.path, // Store the file path of the uploaded document
                uploadedAt: Date.now() // Store the timestamp when the document was uploaded
            };

            // Add the document to the employee's documents array
            employeeDocument.documents.push(document);

            // Save the updated employee document record
            await employeeDocument.save();

            res.status(200).json({ message: 'Document added successfully', employeeDocument });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error adding document', error: err });
        }
    }
];


// Get an employee's data along with documents
exports.getEmployeeDocumentData = async (req, res) => {
    const { empId } = req.params;

    try {
        const employee = await EmployeeDocumentData.findOne({ empId });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Clean up the documents array and map through it to create a well-formed response
        const employeeWithFiles = {
            ...employee.toObject(),
            documents: employee.documents.map(doc => ({
                documentType: doc.documentType,
                filePath: `http://localhost:5000/${doc.filePath.replace(/\\/g, '/')}`, // Convert backslashes to forward slashes
                uploadedAt: doc.uploadedAt,
                _id: doc._id
            }))
        };

        res.status(200).json({ employee: employeeWithFiles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching employee data', error: err });
    }
};

// Update an existing document
exports.editDocument = [
    upload.single('document'), // Middleware for file upload
    async (req, res) => {
        const { empId, documentId, documentType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            // Find the employee document record
            const employeeDocument = await EmployeeDocumentData.findOne({ empId });

            if (!employeeDocument) {
                return res.status(404).json({ message: 'Employee document record not found' });
            }

            // Find the specific document by ID
            const document = employeeDocument.documents.id(documentId);

            if (!document) {
                return res.status(404).json({ message: 'Document not found' });
            }

            // Update document details
            document.documentType = documentType || document.documentType;
            document.filePath = req.file.path; // Update file path with the new uploaded file
            document.uploadedAt = Date.now(); // Update the uploaded timestamp

            // Save the updated document record
            await employeeDocument.save();

            res.status(200).json({
                message: 'Document updated successfully',
                document
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error updating document', error: err });
        }
    }
];
