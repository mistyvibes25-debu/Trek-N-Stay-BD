const express = require('express');
const { getAllTrips, getTripById, createTrip, updateTrip, deleteTrip } = require('../controllers/tripController');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Define multi-field upload for image and video
const tripUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]);

router.get('/', getAllTrips);
router.get('/:id', getTripById);
router.post('/', tripUpload, createTrip);
router.put('/:id', tripUpload, updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;

