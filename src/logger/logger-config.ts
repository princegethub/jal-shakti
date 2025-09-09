import { AsyncLocalStorage } from 'async_hooks';
import safeStringify from 'fast-safe-stringify';
import fs from 'fs';
import type { TransformableInfo } from 'logform';
import path from 'path';
import { performance } from 'perf_hooks';
import { createLogger, format, Logger, transports } from 'winston';
import LokiTransport from 'winston-loki';
import { red, blue, yellow, green, magenta, cyan, gray } from 'colorette';
import * as sourceMapSupport from 'source-map-support';
import { hostname, userInfo } from 'os';
import { randomUUID } from 'crypto';

// Enable source map support for better stack traces
sourceMapSupport.install();

// Context storage for request tracing
const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  operation?: string;
  startTime?: number;
}

// Define metadata types
interface LogMetadata {
  [key: string]: unknown;
  timestamp?: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  operation?: string;
  type?: string;
  duration?: string;
  stack?: string;
}

interface LoggerConfig {
  // Basic config
  appName: string;
  environment: 'development' | 'staging' | 'production' | 'test';
  logLevel: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

  // Directories
  logDir?: string;

  // Transport configs
  enableConsole?: boolean;
  enableFile?: boolean;
  enableMongoDB?: boolean;
  enableLoki?: boolean;
  enableElastic?: boolean;

  // External service configs
  lokiUrl?: string;
  mongoUrl?: string;
  elasticUrl?: string;

  // File rotation settings
  maxFileSize?: string | number;
  maxFiles?: string | number;
  datePattern?: string;

  // Performance settings
  enableMetrics?: boolean;
  enableHealthCheck?: boolean;

  // Security
  enableSanitization?: boolean;
  sensitiveFields?: string[];

  // Rate limiting
  enableRateLimiting?: boolean;
  maxLogsPerSecond?: number;
}

class ProductionLogger {
  private logger: Logger;
  private config: Required<LoggerConfig>;
  private metrics: Map<string, number> = new Map();
  private rateLimitCounter = 0;
  private rateLimitWindow = Date.now();
  private healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  constructor(config: LoggerConfig) {
    // Clear console in development mode on restart
    if (config.environment === 'development') {
      // Skip console.clear() to comply with ESLint
    }

    this.config = this.mergeDefaultConfig(config);
    this.ensureLogDirectory();
    this.logger = this.createWinstonLogger();
    this.setupGracefulShutdown();
    this.setupHealthChecks();

    // Log initialization
    this.info('Logger initialized', {
      // config: this.sanitizeConfig(this.config),
      hostname: hostname(),
      user: userInfo().username,
      pid: process.pid,
      nodeVersion: process.version,
    });
  }

  private mergeDefaultConfig(config: LoggerConfig): Required<LoggerConfig> {
    return {
      appName: config.appName,
      environment: config.environment,
      logLevel: config.logLevel || 'info',
      logDir: config.logDir || this.getDefaultLogDir(config.appName),
      enableConsole:
        config.enableConsole ?? config.environment === 'development',
      enableFile: config.enableFile ?? true,
      enableMongoDB: config.enableMongoDB ?? false,
      enableLoki: config.enableLoki ?? false,
      enableElastic: config.enableElastic ?? false,
      lokiUrl: config.lokiUrl || '',
      mongoUrl: config.mongoUrl || '',
      elasticUrl: config.elasticUrl || '',
      maxFileSize: config.maxFileSize || '20m',
      maxFiles: config.maxFiles || '14d',
      datePattern: config.datePattern || 'YYYY-MM-DD',
      enableMetrics: config.enableMetrics ?? true,
      enableHealthCheck: config.enableHealthCheck ?? true,
      enableSanitization: config.enableSanitization ?? true,
      sensitiveFields: config.sensitiveFields || [
        'password',
        'token',
        'key',
        'secret',
        'auth',
      ],
      enableRateLimiting: config.enableRateLimiting ?? true,
      maxLogsPerSecond: config.maxLogsPerSecond || 1000,
    };
  }

  private getDefaultLogDir(appName: string): string {
    switch (process.platform) {
      case 'win32':
        return path.join(process.env.APPDATA || 'C:\\logs', `${appName}-logs`);
      case 'darwin':
        return `/usr/local/var/log/${appName}-logs`;
      default:
        return `/var/log/${appName}-logs`;
    }
  }

  private ensureLogDirectory(): void {
    try {
      if (!fs.existsSync(this.config.logDir)) {
        fs.mkdirSync(this.config.logDir, { recursive: true });
      }
    } catch (error: unknown) {
      // Log error before throwing
      const errorMessage = `Failed to create log directory: ${this.config.logDir}. ${error instanceof Error ? error.message : String(error)}`;
      // Use process.stderr directly since logger isn't initialized yet
      process.stderr.write(`${errorMessage}\n`);
      throw new Error(errorMessage);
    }
  }

  private createWinstonLogger(): Logger {
    const transportList = [];

    // Console transport with beautiful formatting
    if (this.config.enableConsole) {
      transportList.push(
        new transports.Console({
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            format.errors({ stack: true }),
            format.printf(this.consoleFormatter.bind(this)),
          ),
        }),
      );
    }

    // File transports with rotation
    if (this.config.enableFile) {
      // Combined logs
      transportList.push(
        new transports.File({
          filename: path.join(this.config.logDir, 'app-%DATE%.log'),
          maxsize: this.config.maxFileSize as number,
          maxFiles:
            typeof this.config.maxFiles === 'string'
              ? parseInt(this.config.maxFiles, 10)
              : this.config.maxFiles,
          format: format.combine(
            format.timestamp(),
            format.errors({ stack: true }),
            format.json(),
          ),
        }),
      );

      // Error logs
      transportList.push(
        new transports.File({
          filename: path.join(this.config.logDir, 'error-%DATE%.log'),
          level: 'error',
          maxsize: this.config.maxFileSize as number,
          maxFiles: this.config.maxFiles as number,
          format: format.combine(
            format.timestamp(),
            format.errors({ stack: true }),
            format.json(),
          ),
        }),
      );

      // Performance logs
      transportList.push(
        new transports.File({
          filename: path.join(this.config.logDir, 'performance-%DATE%.log'),
          level: 'debug',
          maxsize:
            typeof this.config.maxFileSize === 'string'
              ? parseInt(this.config.maxFileSize, 10)
              : this.config.maxFileSize,
          maxFiles:
            typeof this.config.maxFiles === 'string'
              ? parseInt(this.config.maxFiles, 10)
              : this.config.maxFiles,
          format: format.combine(
            format.timestamp(),
            format((info) => {
              return info.type === 'performance' ? info : false;
            })(),
            format.json(),
          ),
        }),
      );
    }

    // Loki transport for centralized logging
    if (this.config.enableLoki && this.config.lokiUrl) {
      transportList.push(
        new LokiTransport({
          host: this.config.lokiUrl,
          labels: {
            app: this.config.appName,
            environment: this.config.environment,
            hostname: hostname(),
          },
          json: true,
          format: format.combine(format.timestamp(), format.json()),
          onConnectionError: (err) => {
            this.healthStatus = 'degraded';
            // Log to stderr since logger may be unavailable
            process.stderr.write(`Loki connection error: ${err}\n`);
          },
        }),
      );
    }

    // MongoDB transport removed to fix snappy dependency issues

    return createLogger({
      level: this.config.logLevel,
      defaultMeta:
        this.config.environment === 'production'
          ? {
              service: this.config.appName,
              environment: this.config.environment,
              hostname: hostname(),
              pid: process.pid,
            }
          : undefined,
      transports: transportList,
      exceptionHandlers: [
        new transports.File({
          filename: path.join(this.config.logDir, 'exceptions.log'),
        }),
      ],
      rejectionHandlers: [
        new transports.File({
          filename: path.join(this.config.logDir, 'rejections.log'),
        }),
      ],
      exitOnError: false,
    });
  }

  private consoleFormatter(info: TransformableInfo): string {
    const { timestamp, level, message, stack, ...meta } = info;

    const colorizeLevel = (lvl: string): string => {
      switch (lvl.toUpperCase()) {
        case 'ERROR':
          return red(lvl.toUpperCase());
        case 'WARN':
          return yellow(lvl.toUpperCase());
        case 'INFO':
          return blue(lvl.toUpperCase());
        case 'HTTP':
          return green(lvl.toUpperCase());
        case 'DEBUG':
          return magenta(lvl.toUpperCase());
        case 'TIMESTAMP':
          return gray(lvl.toUpperCase());
        default:
          return cyan(lvl.toUpperCase());
      }
    };

    const context = asyncLocalStorage.getStore();
    const contextStr = context?.requestId ? gray(`[${context.requestId}]`) : '';

    // Simpler output in development
    if (this.config.environment === 'development') {
      let output = `${colorizeLevel(timestamp as string)} [${colorizeLevel(level)}]: ${message}`;
      if (stack) {
        output += `\n${red('STACK:')} ${stack}`;
      }
      return output;
    }

    // Full output in production
    let output = `${green(timestamp as string)} ${colorizeLevel(level)} ${contextStr} ${message}`;

    if (Object.keys(meta).length > 0) {
      const sanitizedMeta = this.sanitizeData(meta);
      output += `\n${gray('META:')} ${safeStringify(sanitizedMeta, undefined, 2)}`;
    }

    if (stack) {
      output += `\n${red('STACK:')} ${stack}`;
    }

    return output;
  }

  private sanitizeData<T>(data: T): T {
    if (!this.config.enableSanitization) return data;

    const sanitize = <U>(obj: U): U => {
      if (typeof obj !== 'object' || obj === null) return obj;

      if (Array.isArray(obj)) {
        return obj.map(sanitize) as U;
      }

      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(
        obj as Record<string, unknown>,
      )) {
        if (
          this.config.sensitiveFields.some((field) =>
            key.toLowerCase().includes(field.toLowerCase()),
          )
        ) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitize(value);
        }
      }
      return sanitized as U;
    };

    return sanitize(data);
  }

  private sanitizeConfig(
    config: Required<LoggerConfig>,
  ): Partial<Required<LoggerConfig>> {
    const { mongoUrl, lokiUrl, elasticUrl, ...safe } = config;
    return {
      ...safe,
      mongoUrl: mongoUrl ? '[CONFIGURED]' : '[NOT SET]',
      lokiUrl: lokiUrl ? '[CONFIGURED]' : '[NOT SET]',
      elasticUrl: elasticUrl ? '[CONFIGURED]' : '[NOT SET]',
    };
  }

  private checkRateLimit(): boolean {
    if (!this.config.enableRateLimiting) return true;

    const now = Date.now();
    if (now - this.rateLimitWindow > 1000) {
      this.rateLimitWindow = now;
      this.rateLimitCounter = 0;
    }

    this.rateLimitCounter++;
    return this.rateLimitCounter <= this.config.maxLogsPerSecond;
  }

  private updateMetrics(level: string): void {
    if (!this.config.enableMetrics) return;

    const key = `logs.${level}`;
    this.metrics.set(key, (this.metrics.get(key) || 0) + 1);
  }

  private setupHealthChecks(): void {
    if (!this.config.enableHealthCheck) return;

    setInterval(() => {
      const errorRate =
        (this.metrics.get('logs.error') || 0) /
        (this.metrics.get('logs.total') || 1);

      if (errorRate > 0.1) {
        this.healthStatus = 'unhealthy';
      } else if (errorRate > 0.05) {
        this.healthStatus = 'degraded';
      } else {
        this.healthStatus = 'healthy';
      }
    }, 60000); // Check every minute
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      this.info(`Received ${signal}. Shutting down gracefully...`);

      try {
        await new Promise<void>((resolve) => {
          this.logger.close();
          resolve();
        });

        this.info('Logger closed successfully');
        process.exit(0);
      } catch (error) {
        // Log to stderr since logger may be closed
        process.stderr.write(`Error during shutdown: ${error}\n`);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  // Context management
  public withContext<T>(context: LogContext, fn: () => T): T {
    return asyncLocalStorage.run(context, fn);
  }

  public setContext(context: Partial<LogContext>): void {
    const current = asyncLocalStorage.getStore() || {};
    asyncLocalStorage.enterWith({ ...current, ...context });
  }

  // Core logging methods
  public error(message: string, meta?: LogMetadata): void {
    if (!this.checkRateLimit()) return;
    this.updateMetrics('error');
    this.logger.error(message, this.enrichMeta(meta));
  }

  public warn(message: string, meta?: LogMetadata): void {
    if (!this.checkRateLimit()) return;
    this.updateMetrics('warn');
    this.logger.warn(message, this.enrichMeta(meta));
  }

  public info(message: string, meta?: LogMetadata): void {
    if (!this.checkRateLimit()) return;
    this.updateMetrics('info');
    this.logger.info(message, this.enrichMeta(meta));
  }

  public debug(message: string, meta?: LogMetadata): void {
    if (!this.checkRateLimit()) return;
    this.updateMetrics('debug');
    this.logger.debug(message, this.enrichMeta(meta));
  }

  public http(message: string, meta?: LogMetadata): void {
    if (!this.checkRateLimit()) return;
    this.updateMetrics('http');
    this.logger.http(message, this.enrichMeta(meta));
  }

  // Performance logging
  public startTimer(operation: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.debug('Performance measurement', {
        type: 'performance',
        operation,
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      });
    };
  }

  // Utility methods
  public profile(name: string): void {
    this.logger.profile(name);
  }

  public getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  public getHealthStatus(): string {
    return this.healthStatus;
  }

  public setLogLevel(level: string): void {
    this.logger.level = level;
    this.info(`Log level changed to: ${level}`);
  }

  private enrichMeta(meta: LogMetadata = {}): LogMetadata {
    const context = asyncLocalStorage.getStore();
    const enriched: LogMetadata = {
      ...meta,
      timestamp: new Date().toISOString(),
      ...(context && {
        requestId: context.requestId,
        userId: context.userId,
        sessionId: context.sessionId,
        correlationId: context.correlationId,
        operation: context.operation,
      }),
    };

    return this.sanitizeData(enriched);
  }

  // Factory method for creating request-scoped loggers
  public createRequestLogger(requestId?: string): ProductionLogger {
    const reqId = requestId || randomUUID();
    const requestLogger = Object.create(this);
    requestLogger.setContext({ requestId: reqId });
    return requestLogger;
  }
}

// Export factory function
export function createProductionLogger(config: LoggerConfig): ProductionLogger {
  return new ProductionLogger(config);
}

// Export types
export type { LoggerConfig, LogContext };
export { ProductionLogger };

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
