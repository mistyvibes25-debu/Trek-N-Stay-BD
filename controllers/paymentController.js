const Booking = require('../models/Booking');

// Placeholder for legacy Razorpay endpoints - now disabled
const createOrder = async (req, res) => {
    res.status(410).json({ message: "Legacy Razorpay integration has been removed. Use UPI flow." });
};

const verifyPayment = async (req, res) => {
    res.status(410).json({ message: "Legacy Razorpay integration has been removed. Use UPI flow." });
};

const getPayments = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, verifyPayment, getPayments };
