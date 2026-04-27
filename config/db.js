const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
    if (cachedConn) return cachedConn;

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables');
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        cachedConn = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        throw error; // Rethrow to allow the errorHandler to capture it
    }
};

module.exports = connectDB;
