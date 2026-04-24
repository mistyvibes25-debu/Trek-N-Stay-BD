const express = require('express');
const { getAllBookings, createBooking, updateBookingStatus, deleteBooking } = require('../controllers/bookingController');

const router = express.Router();

router.get('/', getAllBookings);
router.post('/', createBooking);
router.put('/:id', updateBookingStatus);
router.delete('/:id', deleteBooking);

module.exports = router;
