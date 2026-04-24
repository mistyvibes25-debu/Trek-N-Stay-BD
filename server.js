require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Models
const Trip = require('./models/Trip');
const Destination = require('./models/Destination');
const Booking = require('./models/Booking');
const PromoCode = require('./models/PromoCode');

// Config
const { cloudinary, upload } = require('./config/cloudinary');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// View Engine (Optional, keeping for compatibility)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to Database
connectDB();

// --- API ROUTES CONSOLIDATED ---

// 1. Admin Auth
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ username: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token, message: 'Logged in successfully' });
    } else {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
});

// 2. Trip Operations
app.get('/api/trips', async (req, res) => {
    try {
        const trips = await Trip.find().sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/trips/:id', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.json(trip);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/trips', upload.single('image'), async (req, res) => {
    try {
        const { title, description, location, duration, price, availableSeats, startDate, endDate, category, tax, inclusions, itinerary, mediaType } = req.body;
        let imageUrl = req.file ? req.file.path : '';
        let public_id = req.file ? req.file.filename : '';
        
        const newTrip = new Trip({
            title, description, location, duration, price: Number(price), availableSeats: Number(availableSeats), 
            startDate, endDate, category, tax: Number(tax || 0),
            inclusions: inclusions ? (typeof inclusions === 'string' ? inclusions.split(',').map(s => s.trim()) : inclusions) : [],
            itinerary: itinerary ? (typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary) : [],
            mediaType: mediaType || 'image', imageUrl, public_id
        });
        await newTrip.save();
        res.status(201).json(newTrip);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

app.put('/api/trips/:id', upload.single('image'), async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        
        Object.assign(trip, req.body);
        if (req.file) {
            if (trip.public_id) await cloudinary.uploader.destroy(trip.public_id);
            trip.imageUrl = req.file.path;
            trip.public_id = req.file.filename;
        }
        await trip.save();
        res.json(trip);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

app.delete('/api/trips/:id', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (trip && trip.public_id) await cloudinary.uploader.destroy(trip.public_id);
        await Trip.findByIdAndDelete(req.params.id);
        res.json({ message: 'Trip deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// 3. Destination Operations
app.get('/api/destinations', async (req, res) => {
    try {
        const destinations = await Destination.find().sort({ name: 1 });
        res.json(destinations);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.put('/api/destinations/:id', upload.single('image'), async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.id);
        if (!destination) return res.status(404).json({ message: 'Destination not found' });
        destination.name = req.body.name || destination.name;
        destination.description = req.body.description || destination.description;
        if (req.file) {
            if (destination.public_id) await cloudinary.uploader.destroy(destination.public_id);
            destination.imageUrl = req.file.path;
            destination.public_id = req.file.filename;
        }
        await destination.save();
        res.json(destination);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

// 4. Booking Operations
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('tripId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

app.put('/api/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(booking);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

app.delete('/api/bookings/:id', async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// 5. Promo Code Operations
app.post('/api/promo/create', async (req, res) => {
    try {
        const promo = await PromoCode.create(req.body);
        res.status(201).json(promo);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

app.get('/api/promo/all', async (req, res) => {
    try {
        const promos = await PromoCode.find().sort({ createdAt: -1 });
        res.json(promos);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/promo/validate/:code', async (req, res) => {
    try {
        const promo = await PromoCode.findOne({ code: req.params.code.toUpperCase(), isActive: true });
        if (promo && promo.usedCount < promo.usageLimit) res.json(promo);
        else res.status(400).json({ message: 'Invalid or expired promo code' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/promo/:id', async (req, res) => {
    try {
        await PromoCode.findByIdAndDelete(req.params.id);
        res.json({ message: 'Promo deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 6. Payment Operations (UPI Flow)
app.get('/api/payments', async (req, res) => {
    try {
        const bookings = await Booking.find({ paymentStatus: { $in: ['Completed', 'Awaiting Verification'] } }).populate('tripId').sort({ createdAt: -1 });
        const formatted = bookings.map(b => ({
            _id: b._id, paymentId: b.transactionId || 'MANUAL-UPI', amount: b.totalAmount * 100, createdAt: b.createdAt, bookingId: { userName: b.userName }
        }));
        res.json(formatted);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- FRONTEND SERVING ---
// Serve static files from the React app (once built)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Handle React routing, return all requests to React app
app.use((req, res) => {
    // Check if it's an API call that wasn't caught
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
