const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find().populate('tripId').sort({ createdAt: -1 });
    res.json(bookings);
});

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = asyncHandler(async (req, res) => {
    const { 
        userName, userEmail, userPhone, userAddress, 
        tripId, seats, totalAmount, paymentMethod, 
        transactionId, paymentStatus, promoCode 
    } = req.body;
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
        res.status(404);
        throw new Error('Trip not found');
    }
    
    if (trip.availableSeats < seats) {
        res.status(400);
        throw new Error('Not enough seats available');
    }

    const newBooking = new Booking({
        userName, userEmail, userPhone, userAddress,
        tripId, seats, totalAmount, paymentMethod,
        transactionId, paymentStatus, promoCode
    });

    await newBooking.save();
    res.status(201).json(newBooking);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Admin
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { bookingStatus } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    booking.bookingStatus = bookingStatus || booking.bookingStatus;
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
});

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
const deleteBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }
    res.json({ message: 'Booking deleted successfully' });
});

module.exports = { getAllBookings, createBooking, updateBookingStatus, deleteBooking };

