const Booking = require('../models/Booking');
const Trip = require('../models/Trip');

const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('tripId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createBooking = async (req, res) => {
    try {
        const { 
            userName, userEmail, userPhone, userAddress, 
            tripId, seats, totalAmount, paymentMethod, 
            transactionId, paymentStatus, promoCode 
        } = req.body;
        
        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        
        if (trip.availableSeats < seats) {
            return res.status(400).json({ message: 'Not enough seats available' });
        }

        const newBooking = new Booking({
            userName, userEmail, userPhone, userAddress,
            tripId, seats, totalAmount, paymentMethod,
            transactionId, paymentStatus, promoCode
        });

        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { bookingStatus } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.bookingStatus = bookingStatus || booking.bookingStatus;
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllBookings, createBooking, updateBookingStatus, deleteBooking };
