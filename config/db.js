const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
    if (cachedConn) return cachedConn;

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        cachedConn = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        // Do not use process.exit(1) as it crashes the Vercel function
    }
};

module.exports = connectDB;
