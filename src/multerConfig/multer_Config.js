const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the folder where files will be stored
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = Date.now() + ext; // Ensure unique filenames
        cb(null, fileName);
    }
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only jpeg, png, and jpg images are allowed'), false);
    }
};

// Set up multer middleware
const upload = multer({ storage, fileFilter });

module.exports = { upload }; // Ensure the upload object is being exported correctly
