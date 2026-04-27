const Trip = require('../models/Trip');
const Destination = require('../models/Destination');
const { cloudinary } = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');
const connectDB = require('../config/db');

/**
 * Sync destination count based on location
 */
const syncDestination = async (location) => {
    if (!location) return;
    const regionName = location.split(',')[0].trim();
    const existing = await Destination.findOne({ name: regionName });
    
    if (!existing) {
        await new Destination({ name: regionName }).save();
    }
    
    // Update trip count for this destination
    const count = await Trip.countDocuments({ location: new RegExp('^' + regionName, 'i') });
    await Destination.findOneAndUpdate({ name: regionName }, { tripCount: count });
};

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
const getAllTrips = asyncHandler(async (req, res) => {
    console.log('[API] Fetching all trips...');
    await connectDB(); // Ensure connection is ready for serverless
    console.log('[API] Database connected, querying trips...');
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
});

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Public
const getTripById = asyncHandler(async (req, res) => {
    await connectDB();
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
        res.status(404);
        throw new Error('Trip not found');
    }
    res.json(trip);
});

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private/Admin
const createTrip = asyncHandler(async (req, res) => {
    const { 
        title, description, location, duration, price, 
        availableSeats, startDate, endDate, category, 
        tax, inclusions, itinerary, mediaType 
    } = req.body;
    
    let imageUrl = '';
    let public_id = '';
    let videoUrl = '';
    let public_id_video = '';

    if (req.files) {
        if (req.files.image) {
            imageUrl = req.files.image[0].path;
            public_id = req.files.image[0].filename;
        }
        if (req.files.video) {
            videoUrl = req.files.video[0].path;
            public_id_video = req.files.video[0].filename;
        }
    } else if (req.file) {
        imageUrl = req.file.path;
        public_id = req.file.filename;
    }

    const newTrip = new Trip({
        title, description, location, duration, 
        price: Number(price), availableSeats: Number(availableSeats), 
        startDate, endDate, category: category || 'Trending', 
        tax: Number(tax || 0),
        inclusions: inclusions ? (typeof inclusions === 'string' ? inclusions.split(',').map(s => s.trim()) : inclusions) : [],
        itinerary: itinerary ? (typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary) : [],
        mediaType: mediaType || 'image',
        imageUrl, public_id, videoUrl, public_id_video
    });

    await newTrip.save();
    await syncDestination(location);
    res.status(201).json(newTrip);
});

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private/Admin
const updateTrip = asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
        res.status(404);
        throw new Error('Trip not found');
    }

    const { 
        title, description, location, duration, price, 
        availableSeats, startDate, endDate, category, 
        tax, inclusions, itinerary, mediaType 
    } = req.body;

    trip.title = title || trip.title;
    trip.description = description || trip.description;
    trip.location = location || trip.location;
    trip.duration = duration || trip.duration;
    trip.price = price ? Number(price) : trip.price;
    trip.availableSeats = availableSeats ? Number(availableSeats) : trip.availableSeats;
    trip.startDate = startDate || trip.startDate;
    trip.endDate = endDate || trip.endDate;
    trip.category = category || trip.category;
    trip.tax = tax ? Number(tax) : trip.tax;
    trip.mediaType = mediaType || trip.mediaType;

    if (inclusions) {
        trip.inclusions = typeof inclusions === 'string' ? inclusions.split(',').map(s => s.trim()) : inclusions;
    }

    if (itinerary) {
        trip.itinerary = typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary;
    }

    if (req.files) {
        if (req.files.image) {
            if (trip.public_id) await cloudinary.uploader.destroy(trip.public_id);
            trip.imageUrl = req.files.image[0].path;
            trip.public_id = req.files.image[0].filename;
        }
        if (req.files.video) {
            if (trip.public_id_video) await cloudinary.uploader.destroy(trip.public_id_video, { resource_type: 'video' });
            trip.videoUrl = req.files.video[0].path;
            trip.public_id_video = req.files.video[0].filename;
        }
    } else if (req.file) {
        if (trip.public_id) await cloudinary.uploader.destroy(trip.public_id);
        trip.imageUrl = req.file.path;
        trip.public_id = req.file.filename;
    }

    const updatedTrip = await trip.save();
    if (location) await syncDestination(location);
    res.json(updatedTrip);
});

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private/Admin
const deleteTrip = asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
        res.status(404);
        throw new Error('Trip not found');
    }

    if (trip.public_id) await cloudinary.uploader.destroy(trip.public_id);
    if (trip.public_id_video) await cloudinary.uploader.destroy(trip.public_id_video, { resource_type: 'video' });

    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted' });
});

module.exports = { getAllTrips, getTripById, createTrip, updateTrip, deleteTrip };

