import 'module-alias/register';
import mongoose from 'mongoose';
import app from './app.js';
import config from '@/config/config.js';
import { logger } from '@/logger/logger';
import { EventBus } from '@/services/events/event-bus';
import { AuthEventHandler } from '@/services/events/auth-event-handler';

let server: import('http').Server;

async function initializeServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url);
    logger.info('Connected to MongoDB');

    // Initialize Event Bus
    const eventBus = EventBus.getInstance();
    await eventBus.initialize();

    // Initialize Event Handlers
    const authEventHandler = new AuthEventHandler();
    await authEventHandler.initialize();

    // Start server
    server = app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to initialize services:', { error });
    process.exit(1);
  }
}

// Initialize all services
initializeServices();

const exitHandler = async () => {
  try {
    if (server) {
      // Disconnect EventBus
      const eventBus = EventBus.getInstance();
      await eventBus.disconnect();
      logger.info('EventBus disconnected');

      // Disconnect MongoDB
      await mongoose.disconnect();
      logger.info('MongoDB disconnected');

      // Close server
      server.close(() => {
        logger.info('Server closed');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  } catch (error) {
    logger.error('Error during shutdown:', { error });
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error) => {
  logger.error(error.message, { error });
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
