const Employee = require('../../Model/AuthModel/EMP_AuthModel');
const Attendance = require("../../Model/AttendanceModel/Attendance_model");

// Record Attendance (Punch-In or Punch-Out)
const recordAttendance = async (req, res) => {
    try {
        const { emp_id, date, time, wifi_ip, QrMsg } = req.body;


        const Store_wifi_ip_1 = "103.178.126.61";
        const Store_wifi_ip_2 = "192.168.1.21";
        const employee = await Employee.findOne({ empID: emp_id });
        if (QrMsg !== "Attendance") {
            return res.status(404).json({ statusCode: 404, result: false, message: "QR Code is not Match" });
        }
        if (!employee) {
            return res.status(404).json({ statusCode: 404, result: false, message: "Employee not found" });
        }

        // Check if WiFi IP matches the registered one
        if (wifi_ip !== Store_wifi_ip_1 && wifi_ip !== Store_wifi_ip_2) {
            return res.status(400).json({ statusCode: 400, result: false, message: `You are not connected with TechMET Solution Pvt Ltd Wifi.${wifi_ip}` });
        }

        // Check if the employee has already scanned in today
        const existingAttendance = await Attendance.findOne({
            emp_id,
            date,
        });

        const currentTime = new Date(time);
        const hour = currentTime.getHours();

        console.log("Current time:", currentTime);
        // If the employee has already punched in today
        if (existingAttendance) {
            // If it's after 1 PM, allow punch-out, otherwise show error if punch-in is missing
            if (hour >= 13) {
                if (existingAttendance.punch_in === true && !existingAttendance.punch_out_time) {
                    // Create a punch-out record
                    existingAttendance.punch_out_time = time;
                    existingAttendance.punch_in = false;
                    existingAttendance.wifi_ip = wifi_ip;
                    await existingAttendance.save();
                    return res.status(200).json({ statusCode: 200, result: true, message: "Punch-out recorded successfully", attendance: existingAttendance });
                } else {
                    return res.status(400).json({ statusCode: 400, result: false, message: "You must punch-in before punching out." });
                }
            } else {
                return res.status(400).json({ statusCode: 400, result: false, message: "Attendance already recorded for the day." });
            }
        } else {

            const punchIn = new Attendance({
                emp_id,
                date,
                punch_in_time: time,
                punch_in: true,
                wifi_ip,
            });

            await punchIn.save();
            return res.status(200).json({ statusCode: 200, result: true, message: "Punch-in recorded successfully", attendance: punchIn });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ statusCode: 500, result: false, message: "Server error", error: error.message });
    }
};

module.exports = { recordAttendance };
