const express = require('express');
const leaveRouter = express.Router();
const leaveController = require('../Controller/Leave/LeaveController');

leaveRouter.post('/apply', leaveController.applyForLeave);
leaveRouter.get('/employee/:empId', leaveController.getEmployeeData);
module.exports = leaveRouter;
