import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Cache for serverless environments
let isConnected = false;

export const connectDB = async (): Promise<void> => {
  // If already connected in serverless, return
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const mongoURI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

    // Mongoose options optimized for serverless
    const options = {
      bufferCommands: false, // Disable buffering
      maxPoolSize: 10, // Limit connection pool size
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, options);
    isConnected = true;
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    isConnected = false;
    
    // In serverless, throw error instead of exit
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw error;
    } else {
      process.exit(1);
    }
  }
};
