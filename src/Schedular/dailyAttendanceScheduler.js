const cron = require('node-cron');
const { initializeDailyRecords } = require('../Controller/Attendance/Attendance_Controller');

// Schedule a task to run every day at 12:50 PM
cron.schedule('35 14 * * *', async () => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    console.log(`Running daily attendance initialization at 2:35 PM for date: ${currentDate}`);

    try {
        await initializeDailyRecords(currentDate);
        console.log("Daily attendance records initialized successfully.");
    } catch (error) {
        console.error("Error initializing daily attendance records:", error);
    }
});

