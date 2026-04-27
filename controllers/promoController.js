const PromoCode = require('../models/PromoCode');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new promo code
// @route   POST /api/promo/create
// @access  Private/Admin
const createPromo = asyncHandler(async (req, res) => {
    const promo = await PromoCode.create(req.body);
    res.status(201).json(promo);
});

// @desc    Get all promo codes
// @route   GET /api/promo/all
// @access  Private/Admin
const getAllPromos = asyncHandler(async (req, res) => {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promos);
});

// @desc    Validate a promo code
// @route   GET /api/promo/validate/:code
// @access  Public
const validatePromo = asyncHandler(async (req, res) => {
    const promo = await PromoCode.findOne({ 
        code: req.params.code.toUpperCase(), 
        isActive: true 
    });

    if (promo) {
        if (promo.usedCount >= promo.usageLimit) {
            res.status(400);
            throw new Error('Promo code usage limit has been reached.');
        }
        res.json(promo);
    } else {
        res.status(404);
        throw new Error('Invalid or inactive promo code.');
    }
});

// @desc    Delete a promo code
// @route   DELETE /api/promo/:id
// @access  Private/Admin
const deletePromo = asyncHandler(async (req, res) => {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) {
        res.status(404);
        throw new Error('Promo code not found');
    }
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promo code deleted successfully.' });
});

module.exports = {
    createPromo,
    getAllPromos,
    validatePromo,
    deletePromo
};
