const express = require('express');
const Emp_router = express.Router();
const { getAllEmployees } = require('../Controller/Employee_Data/Employee_Controller');

Emp_router.get('/employees', getAllEmployees);

module.exports = Emp_router;
