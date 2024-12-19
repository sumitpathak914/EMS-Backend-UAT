const Employee = require('../../Model/AuthModel/EMP_AuthModel');
const Attendance = require("../../Model/AttendanceModel/Attendance_model");

// Helper function to initialize or update daily attendance records
const initializeDailyRecords = async (date) => {
    try {
        // Fetch all employees
        const employees = await Employee.find();

        for (const employee of employees) {
            const emp_id = employee.empID;

            // Find existing attendance record for the employee
            let existingAttendance = await Attendance.findOne({ emp_id });

            if (!existingAttendance) {
                // If the employee has no attendance records, create a new entry
                existingAttendance = new Attendance({
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
                await existingAttendance.save();
            } else {
                // If attendance exists, find the record for the current date
                const recordForToday = existingAttendance.records.find(record => record.date === date);

                if (!recordForToday) {
                    // If there's no record for the current date, add a blank record
                    existingAttendance.records.push({
                        date,
                        punch_in_time: null,
                        punch_out_time: null,
                        punch_in: false,
                        wifi_ip: null
                    });
                    await existingAttendance.save();
                } else if (!recordForToday.punch_in_time || !recordForToday.punch_out_time) {
                    // If the record exists but punch_in_time or punch_out_time is null, update it
                    recordForToday.punch_in_time = recordForToday.punch_in_time || null; // Ensure punch_in_time is set if not already
                    recordForToday.punch_out_time = recordForToday.punch_out_time || null; // Ensure punch_out_time is set if not already
                    await existingAttendance.save();
                }
            }
        }
    } catch (error) {
        console.error("Error initializing or updating daily records:", error);
    }
};

// Record Attendance (Punch-In or Punch-Out)
const recordAttendance = async (req, res) => {
    try {
        const { emp_id, date, time, wifi_ip, QrMsg } = req.body;
        const Store_wifi_ip_1 = "103.178.126.61";
        const Store_wifi_ip_2 = "103.173.240.192";
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
        if (wifi_ip !== Store_wifi_ip_1 && wifi_ip !== Store_wifi_ip_2 ) {
            return res.status(400).json({
                statusCode: 400,
                result: false,
                message: `You are not connected to TechMET Solution Pvt Ltd WiFi. Detected WiFi IP: ${wifi_ip}`
            });
        }

        // Initialize or update records for the day
        await initializeDailyRecords(date);

        // Fetch attendance record for the employee
        const existingAttendance = await Attendance.findOne({ emp_id });

        if (!existingAttendance) {
            return res.status(404).json({
                statusCode: 404,
                result: false,
                message: "Attendance record not found for the given employee."
            });
        }

        // Find today's attendance record
        const todayRecord = existingAttendance.records.find(record => record.date === date);

        if (!todayRecord) {
            return res.status(404).json({
                statusCode: 404,
                result: false,
                message: "No attendance record found for today."
            });
        }

        const currentTime = new Date(time);
        const hour = currentTime.getHours();
        const minute = currentTime.getMinutes();

        console.log("Current time:", currentTime);

        if (todayRecord) {
            if (!todayRecord.punch_in_time) {
                // Handle the scenario where the punch-in has not occurred yet
                todayRecord.punch_in_time = time;
                todayRecord.punch_in = true;
                todayRecord.wifi_ip = wifi_ip;

                // Check if the punch-in is after 9 AM and set status accordingly
                const punchInTime = new Date(todayRecord.punch_in_time);
                if (punchInTime.getHours() >= 9) {
                    todayRecord.status = 'Late';
                } else {
                    todayRecord.status = 'Present';
                }

                await existingAttendance.save();
                return res.status(200).json({
                    statusCode: 200,
                    result: true,
                    message: "Punch-in recorded successfully",
                    attendance: existingAttendance
                });
            } else if (todayRecord.punch_in_time && !todayRecord.punch_out_time) {
                // Handle punch-out
                if (hour >= 13) {
                    todayRecord.punch_out_time = time;
                    todayRecord.punch_in = false; // Set to false when punch-out occurs
                    todayRecord.wifi_ip = wifi_ip;

                    // Calculate and update the status based on the punch-in and punch-out times
                    const punchInTime = new Date(todayRecord.punch_in_time);
                    const punchOutTime = new Date(todayRecord.punch_out_time);
                    const timeDifference = (punchOutTime - punchInTime) / (1000 * 60 * 60); // Time difference in hours

                    if (timeDifference < 4) {
                        return res.status(400).json({
                            statusCode: 400,
                            result: false,
                            message: "Punch-out can only be recorded after Complete 4 Hr."
                        });
                        // todayRecord.status = 'Absent';
                    } else if (timeDifference >= 4 && timeDifference < 9) {
                        todayRecord.status = 'Half Day';
                    } else if (timeDifference >= 9) {
                        todayRecord.status = 'Full Day';
                    }

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
                        message: "Punch-out can only be recorded after 1 PM."
                    });
                }
            } else if (todayRecord.punch_in_time && todayRecord.punch_out_time) {
                // If both punch-in and punch-out have already been recorded
                return res.status(400).json({
                    statusCode: 400,
                    result: false,
                    message: "Attendance for today has already been recorded."
                });
            }
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

module.exports = { recordAttendance, getEmployeeAttendance, initializeDailyRecords };
