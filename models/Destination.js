const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: 'Discover the breathtaking beauty and rich heritage of this majestic region.' },
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=2000' },
    public_id: { type: String }, // For Cloudinary
    tripCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
