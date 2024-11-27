const Employee = require('../../Model/AuthModel/EMP_AuthModel');
const Attendance = require("../../Model/AttendanceModel/Attendance_model");

// Helper function to initialize blank attendance records
const initializeDailyRecords = async (date) => {
    try {
        // Fetch all employees
        const employees = await Employee.find();

        for (const employee of employees) {
            const emp_id = employee.empID;

            // Check if the employee already has attendance for the current date
            const existingAttendance = await Attendance.findOne({ emp_id });

            if (!existingAttendance) {
                // If the employee has no attendance records, create one
                const newAttendance = new Attendance({
                    emp_id,
                    records: [
                        {
                            date,
                            punch_in_time: null,
                            punch_out_time: null,
                            punch_in: false,
                            wifi_ip: null
                        }
                    ]
                });
                await newAttendance.save();
            } else {
                // If attendance exists, check if there's a record for the current date
                const recordForToday = existingAttendance.records.find(record => record.date === date);

                if (!recordForToday) {
                    // Add a blank record for the current date
                    existingAttendance.records.push({
                        date,
                        punch_in_time: null,
                        punch_out_time: null,
                        punch_in: false,
                        wifi_ip: null
                    });
                    await existingAttendance.save();
                }
            }
        }
    } catch (error) {
        console.error("Error initializing daily records:", error);
    }
};

// Record Attendance (Punch-In or Punch-Out)
const recordAttendance = async (req, res) => {
    try {
        const { emp_id, date, time, wifi_ip, QrMsg } = req.body;

        const Store_wifi_ip_1 = "103.178.126.61";

        // Validate QR code
        if (QrMsg !== "Attendance") {
            return res.status(404).json({
                statusCode: 404,
                result: false,
                message: "QR Code does not match"
            });
        }

        // Find the employee by ID
        const employee = await Employee.findOne({ empID: emp_id });
        if (!employee) {
            return res.status(404).json({
                statusCode: 404,
                result: false,
                message: "Employee not found"
            });
        }

        // Check WiFi IP address
        if (wifi_ip !== Store_wifi_ip_1) {
            return res.status(400).json({
                statusCode: 400,
                result: false,
                message: `You are not connected to TechMET Solution Pvt Ltd WiFi. Detected WiFi IP: ${wifi_ip}`
            });
        }

        // Initialize blank records for the day
        await initializeDailyRecords(date);

        // Fetch attendance record for the employee
        const existingAttendance = await Attendance.findOne({ emp_id });

        // Find today's attendance record
        const todayRecord = existingAttendance.records.find(record => record.date === date);

        const currentTime = new Date(time);
        const hour = currentTime.getHours();

        console.log("Current time:", currentTime);

        if (todayRecord) {
            // Handle Punch-Out
            if (hour >= 13) {
                if (todayRecord.punch_in && !todayRecord.punch_out_time) {
                    todayRecord.punch_out_time = time;
                    todayRecord.punch_in = false;
                    todayRecord.wifi_ip = wifi_ip;
                    await existingAttendance.save();
                    return res.status(200).json({
                        statusCode: 200,
                        result: true,
                        message: "Punch-out recorded successfully",
                        attendance: existingAttendance
                    });
                } else {
                    return res.status(400).json({
                        statusCode: 400,
                        result: false,
                        message: "You must punch-in before punching out."
                    });
                }
            } else {
                return res.status(400).json({
                    statusCode: 400,
                    result: false,
                    message: "Attendance already recorded for the day."
                });
            }
        } else {
            // Handle Punch-In
            todayRecord.punch_in_time = time;
            todayRecord.punch_in = true;
            todayRecord.wifi_ip = wifi_ip;
            await existingAttendance.save();
            return res.status(200).json({
                statusCode: 200,
                result: true,
                message: `Punch-in recorded successfully. WiFi IP: ${wifi_ip}`,
                attendance: existingAttendance
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            result: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getEmployeeAttendance = async (req, res) => {
    try {
        const { emp_id } = req.body;

        // Validate if emp_id is provided
        if (!emp_id) {
            return res.status(400).json({
                statusCode: 400,
                result: false,
                message: "Employee ID is required"
            });
        }

        // Find attendance for the given emp_id
        const attendance = await Attendance.findOne({ emp_id });

        if (!attendance) {
            return res.status(404).json({
                statusCode: 404,
                result: false,
                message: "Attendance records not found for the given employee ID"
            });
        }

        // Sort records by date in descending order (most recent first)
        const sortedRecords = attendance.records.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            statusCode: 200,
            result: true,
            message: "Attendance records fetched successfully",
            records: sortedRecords
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            result: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = { recordAttendance, getEmployeeAttendance,initializeDailyRecords };
