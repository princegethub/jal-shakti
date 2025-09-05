import appConfig from '@/config/config';
import { createProductionLogger } from './logger-config';

export const logger = createProductionLogger({
  appName: appConfig.LOG_APP_NAME || 'jal-shakti',
  environment: appConfig.env || 'development',
  logLevel: (process.env.LOG_LEVEL || 'silly') as
    | 'error'
    | 'info'
    | 'silly'
    | 'warn'
    | 'http'
    | 'verbose'
    | 'debug',
  logDir: appConfig.LOG_DIR,
  enableConsole: (appConfig.env || 'development') === 'development',
  enableFile: (appConfig.env || 'development') !== 'development',
  enableMongoDB: false,
  enableLoki: !!process.env.LOKI_HOST_URL,
  enableElastic: false,
  lokiUrl: process.env.LOKI_HOST_URL,
  mongoUrl: process.env.MONGODB_URL,
  elasticUrl: process.env.ELASTIC_URL,
  maxFileSize: process.env.MAX_FILE_SIZE || '20m',
  maxFiles: process.env.MAX_FILES || '14d',
  datePattern: process.env.DATE_PATTERN || 'YYYY-MM-DD',
  enableMetrics: true,
  enableHealthCheck: true,
  enableSanitization: true,
  sensitiveFields: ['password', 'token', 'key', 'secret', 'auth'],
  enableRateLimiting: true,
  maxLogsPerSecond: 1000,
});
export default logger;

// Example usage:
/*
const logger = createProductionLogger({
  appName: 'my-app',
  environment: 'production',
  logLevel: 'info',
  enableLoki: true,
  lokiUrl: 'https://loki.example.com',
  enableMongoDB: true,
  mongoUrl: 'mongodb://localhost:27017/logs'
});

// Basic logging
logger.info('Application started', { version: '1.0.0' });

// With context
logger.withContext({ requestId: '123', userId: 'user-456' }, () => {
  logger.info('Processing request');
  logger.error('Something went wrong', { error: new Error('Test') });
});

// Performance timing
const timer = logger.startTimer('database-query');
// ... do database operation
timer(); // Logs the duration

// Request-scoped logger
const requestLogger = logger.createRequestLogger('req-789');
requestLogger.info('Request processed');
*/
