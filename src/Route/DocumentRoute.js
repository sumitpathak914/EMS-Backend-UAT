const express = require('express');
const Documentrouter = express.Router();
const employeeController = require('../../src/Controller/Document/DocumentController');

// Route to add documents to an existing employee
Documentrouter.post('/employee/documents', employeeController.addDocument);

// Route to get employee data along with documents
Documentrouter.get('/employee-Document/:empId', employeeController.getEmployeeDocumentData);

module.exports = Documentrouter;
