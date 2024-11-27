const Employee = require('../../Model/AuthModel/EMP_AuthModel');
const Attendance = require("../../Model/AttendanceModel/Attendance_model");

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

        // Fetch attendance record for the employee
        const existingAttendance = await Attendance.findOne({ emp_id });

        const currentTime = new Date(time);
        const hour = currentTime.getHours();

        console.log("Current time:", currentTime);

        // Initialize employee attendance array if it doesn't exist
        if (!existingAttendance) {
            const newAttendance = new Attendance({
                emp_id,
                records: [
                    {
                        date,
                        punch_in_time: time,
                        punch_in: true,
                        wifi_ip
                    }
                ]
            });

            await newAttendance.save();
            return res.status(200).json({
                statusCode: 200,
                result: true,
                message: `Punch-in recorded successfully. WiFi IP: ${wifi_ip}`,
                attendance: newAttendance
            });
        }

        // Check if attendance for the specific date already exists
        const attendanceForDate = existingAttendance.records.find(record => record.date === date);

        if (attendanceForDate) {
            // Handle punch-out logic if after 1 PM
            if (hour >= 13) {
                if (attendanceForDate.punch_in && !attendanceForDate.punch_out_time) {
                    attendanceForDate.punch_out_time = time;
                    attendanceForDate.punch_in = false;
                    attendanceForDate.wifi_ip = wifi_ip;
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
                    message: `Attendance already recorded for the day. WiFi IP: ${wifi_ip}`
                });
            }
        } else {
            // Add new attendance record for the date
            existingAttendance.records.push({
                date,
                punch_in_time: time,
                punch_in: true,
                wifi_ip
            });
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

module.exports = { recordAttendance };
