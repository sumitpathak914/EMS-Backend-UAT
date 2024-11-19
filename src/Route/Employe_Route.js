const express = require('express');
const Emp_router = express.Router();
const { getAllEmployees } = require('../Controller/Employee_Data/Employee_Controller');
const { recordAttendance } = require('../Controller/Attendance/Attendance_Controller');
Emp_router.get('/employees', getAllEmployees);
Emp_router.post('/Attendace-Records', recordAttendance);

module.exports = Emp_router;
