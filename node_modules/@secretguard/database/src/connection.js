import mongoose from "mongoose";
import { logger } from "../../../packages/shared/src/utils/logger.js";

const DEFAULT_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/secretguard";

export async function connectDB(customUri) {
  const uri = customUri || DEFAULT_URI;

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const options = {
    maxPoolSize: 20,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000
  };

  try {
    await mongoose.connect(uri, options);
    logger.success(`Connected to MongoDB database: ${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw err;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB.");
  }
}

export { mongoose };