const express = require('express');
const Work_Report_router = express.Router();
const workReportController = require('../Controller/Work_Report/Work_Report_Controller');

Work_Report_router.post('/store-report', workReportController.storeWorkReport);
Work_Report_router.post('/getReports', workReportController.getAllWorkReports);
module.exports = Work_Report_router;
