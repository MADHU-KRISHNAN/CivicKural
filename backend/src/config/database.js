const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      logger.warn('No MONGODB_URI provided in environment variables');
      logger.info('Running in demo mode - some features may not work without a database');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    logger.warn('Failed to connect to MongoDB. Server will continue without database.');
    logger.info('To fix this:');
    logger.info('1. Install MongoDB locally, or');
    logger.info('2. Use MongoDB Atlas (cloud), or');
    logger.info('3. Update MONGODB_URI in your .env file');
    // Don't exit the process, continue without DB
  }
};

// Connection event listeners
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

module.exports = connectDB;