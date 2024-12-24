const express = require('express');
const Emp_router = express.Router();
const { getAllEmployees } = require('../Controller/Employee_Data/Employee_Controller');
const { recordAttendance, getEmployeeAttendance, addManualAttendance } = require('../Controller/Attendance/Attendance_Controller');
Emp_router.get('/employees', getAllEmployees);
Emp_router.post('/Attendace-Records', recordAttendance);
Emp_router.post('/GetEmp-Attendace-Records', getEmployeeAttendance);
Emp_router.post('/Manually-Attendace', addManualAttendance );
module.exports = Emp_router;
