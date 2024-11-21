// controllers/wifiController.js

const wifi = require('node-wifi');

// Initialize the wifi module
wifi.init({
    iface: null // Use default interface (can specify a particular interface like 'wlan0' on Linux)
});

// Function to get the current Wi-Fi SSID
const getCurrentWifiSSID = (req, res) => {
    wifi.getCurrentConnections((error, currentConnections) => {
        if (error) {
            return res.status(500).json({
                message: "Cannot get current SSID!",
                error: error
            });
        }
        if (currentConnections.length > 0) {
            return res.status(200).json({
                message: "Current Wi-Fi SSID fetched successfully",
                ssid: currentConnections[0].ssid
            });
        } else {
            return res.status(404).json({
                message: "No Wi-Fi connection found!"
            });
        }
    });
};

module.exports = { getCurrentWifiSSID };
