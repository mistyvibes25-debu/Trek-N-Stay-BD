const express = require('express');
const { createOrder, verifyPayment, getPayments } = require('../controllers/paymentController');

const router = express.Router();

router.get('/', getPayments);
router.post('/create-order', createOrder); // Kept for API compatibility, returns 410
router.post('/verify', verifyPayment);      // Kept for API compatibility, returns 410

module.exports = router;
