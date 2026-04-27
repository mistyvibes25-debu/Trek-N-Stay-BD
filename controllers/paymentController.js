const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Placeholder for legacy Razorpay endpoints
// @route   POST /api/payments/create-order
// @access  Public
const createOrder = asyncHandler(async (req, res) => {
    res.status(410).json({ message: "Legacy Razorpay integration has been removed. Use UPI flow." });
});

// @desc    Placeholder for legacy Razorpay verification
// @route   POST /api/payments/verify
// @access  Public
const verifyPayment = asyncHandler(async (req, res) => {
    res.status(410).json({ message: "Legacy Razorpay integration has been removed. Use UPI flow." });
});

// @desc    Get payments (based on bookings)
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = asyncHandler(async (req, res) => {
    // Return bookings as "payments" for the Finance view
    const bookings = await Booking.find({ 
        paymentStatus: { $in: ['Completed', 'Awaiting Verification'] } 
    }).populate('tripId').sort({ createdAt: -1 });
    
    // Map to a format expected by the frontend ledger
    const formattedPayments = bookings.map(booking => ({
        _id: booking._id,
        paymentId: booking.transactionId || 'MANUAL-UPI',
        orderId: booking._id.toString(),
        amount: booking.totalAmount * 100, // Frontend expects paise
        createdAt: booking.createdAt,
        bookingId: {
            userName: booking.userName
        }
    }));

    res.status(200).json(formattedPayments);
});

module.exports = { createOrder, verifyPayment, getPayments };

