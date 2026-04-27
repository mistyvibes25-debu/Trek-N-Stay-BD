require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Routes
const adminRoutes = require('./routes/adminRoutes');
const tripRoutes = require('./routes/tripRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const promoRoutes = require('./routes/promoRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Initialize App
const app = express();

// Connect to Database
connectDB();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route (API Landing Page)
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Trek N Stay API', 
        message: 'High-performance MERN backend architecture with Cloudinary, JWT, and MongoDB.',
        status: 'Operational & Secure'
    });
});


// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Static files for production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback for React Router
app.get('*path', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
});


// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;

