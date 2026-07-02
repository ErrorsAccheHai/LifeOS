const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,  // 30s — enough for Atlas cold start
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
      });

      logger.info(`MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err}`);
      });
      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Reconnecting...');
        setTimeout(() => connectDB(1), 5000);
      });
      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

      return; // success — stop retrying

    } catch (error) {
      logger.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        logger.error('All connection attempts exhausted. Exiting.');
        process.exit(1);
      }
      const wait = attempt * 3000; // 3s, 6s, 9s...
      logger.info(`Retrying in ${wait / 1000}s...`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
};

module.exports = connectDB;
