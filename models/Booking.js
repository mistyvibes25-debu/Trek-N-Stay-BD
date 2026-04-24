const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userPhone: { type: String },
    userAddress: { type: String },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    seats: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    bookingStatus: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Awaiting Verification'], default: 'Pending' },
    paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Awaiting Verification'], default: 'Pending' },
    paymentMethod: { type: String, default: 'UPI' },
    transactionId: { type: String },
    promoCode: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
