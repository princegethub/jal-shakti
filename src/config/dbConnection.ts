import mongoose from 'mongoose';
import config from '@/config/config';
import logger from '@/logger/logger';
import { databaseErrors } from '@/utils/api-error';

interface DBConnection {
  connect: () => Promise<typeof mongoose>;
  disconnect: () => Promise<void>;
}

const dbConnection: DBConnection = {
  connect: async () => {
    try {
      if (!config.mongoose.url) {
        throw databaseErrors.databaseUrlNotFound();
      }

      // Configure mongoose
      mongoose.set('strictQuery', true);

      // Connect to MongoDB
      await mongoose.connect(config.mongoose.url, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        maxPoolSize: 10,
      });

      logger.info('Database connected successfully ❤️');
      return mongoose;
    } catch (error) {
      logger.error('MongoDB connection error:', { error });
      throw error;
    }
  },

  disconnect: async () => {
    try {
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('MongoDB disconnect error:', { error });
      throw error;
    }
  },
};

export default dbConnection;
