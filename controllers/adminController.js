const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    // Default credentials (In production, these should be in DB or ENV)
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign(
            { username: 'admin', role: 'admin' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );
        
        res.json({ 
            token, 
            message: 'Logged in successfully' 
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

module.exports = { loginAdmin };
