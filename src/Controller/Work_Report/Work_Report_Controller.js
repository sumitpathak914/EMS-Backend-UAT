const WorkReport = require('../../Model/WorkReport/DailyWorkReport'); // Import the WorkReport model

exports.storeWorkReport = async (req, res) => {
    try {
        const { emp_id, reportData } = req.body; // Expecting emp_id and an array of reports

        // Validate input
        if (!emp_id || !Array.isArray(reportData) || reportData.length === 0) {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        // Check if all reports have the same `todayDate`
        const uniqueDates = new Set(reportData.map(report => {
            const normalizedDate = new Date(report.todayDate);
            normalizedDate.setHours(0, 0, 0, 0); // Normalize the time part
            return normalizedDate.getTime();
        }));

        if (uniqueDates.size !== 1) {
            return res.status(400).json({ message: 'All reports must have the same todayDate' });
        }

        // Normalize the date from the incoming data
        const normalizedDate = new Date(reportData[0].todayDate);


        // Check if the report for today already exists for the employee
        let workReport = await WorkReport.findOne({ emp_id });

        if (workReport) {
            // Check if there is already a report for the specific `todayDate`
            const existingReport = workReport.reports.find(r => r.todayDate.getTime() === normalizedDate.getTime());
            if (existingReport) {
                return res.status(409).json({
                    message: `A report for ${normalizedDate.toISOString().split('T')[0]} already exists.`,
                    existingReport: existingReport
                });
            }
        }

        // Group reports by date and prepare for saving
        const groupedReports = {
            todayDate: normalizedDate,
            details: reportData
        };

        if (!workReport) {
            // Create a new document if the employee doesn't exist
            workReport = new WorkReport({
                emp_id,
                reports: [groupedReports]
            });
        } else {
            // Add the new report for today's date if it doesn't exist
            workReport.reports.push(groupedReports);
        }

        // Save the updated work report to the database
        await workReport.save();

        res.status(201).json({
            message: 'Work report saved successfully',
            data: workReport
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
};
exports.getAllWorkReports = async (req, res) => {
    try {
        const { emp_id } = req.body; // Get `emp_id` from request parameters

        // Validate `emp_id`
        if (!emp_id) {
            return res.status(400).json({ message: 'Employee ID is required' });
        }

        // Find work reports for the given `emp_id` and sort by `todayDate`
        const workReport = await WorkReport.findOne({ emp_id }).sort({ 'reports.todayDate': -1 });

        if (!workReport) {
            return res.status(404).json({ status: false, statusCode: 404, message: 'No work reports found for the given employee ID', data:[] });
        }

        // Send the sorted reports as the response
        res.status(200).json({
            message: 'Work reports retrieved successfully',
            data: workReport.reports
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
            , workReport: []
        });
    }
};