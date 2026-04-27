const Destination = require('../models/Destination');
const { cloudinary } = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
const getAllDestinations = asyncHandler(async (req, res) => {
    const destinations = await Destination.find().sort({ name: 1 });
    res.json(destinations);
});

// @desc    Update a destination
// @route   PUT /api/destinations/:id
// @access  Private/Admin
const updateDestination = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
        res.status(404);
        throw new Error('Destination not found');
    }

    destination.name = name || destination.name;
    destination.description = description || destination.description;

    if (req.file) {
        if (destination.public_id) {
            await cloudinary.uploader.destroy(destination.public_id);
        }
        destination.imageUrl = req.file.path;
        destination.public_id = req.file.filename;
    }

    const updatedDestination = await destination.save();
    res.json(updatedDestination);
});

module.exports = { getAllDestinations, updateDestination };

