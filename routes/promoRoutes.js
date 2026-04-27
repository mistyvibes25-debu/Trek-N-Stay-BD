const express = require('express');
const { 
    createPromo, 
    getAllPromos, 
    validatePromo, 
    deletePromo 
} = require('../controllers/promoController');

const router = express.Router();

router.post('/create', createPromo);
router.get('/all', getAllPromos);
router.get('/validate/:code', validatePromo);
router.delete('/:id', deletePromo);

module.exports = router;

