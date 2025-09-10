import Redis from 'ioredis';
import config from '@/config/config';
import { logger } from '@/logger/logger';
import { RedisConfig, SupportedTypeEnum } from '@/types/index';

// For better error logging
const formatError = (error: unknown): object => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }
  return { message: String(error) };
};

/**
 * Default Redis configuration with production-ready settings
 */
const defaultConfig: RedisConfig = {
  host: config.redis.host || 'localhost',
  port: Number(config.redis.port) || 56379,
  password: config.redis.password || '324234',
  db: 0,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    logger.warn(
      `Retrying Redis connection attempt ${times}, delay: ${delay}ms`,
    );
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  reconnectOnError: (err: Error) => {
    logger.error('Redis reconnect error:', { error: formatError(err) });
    return true; // always try to reconnect
  },
  showFriendlyErrorStack: true,
};

// Create Redis client instance
const redis = new Redis(defaultConfig);

// Setup event handlers
redis.on('error', (error) => {
  logger.error('Redis Client Error:', {
    error: formatError(error),
    config: {
      host: defaultConfig.host,
      port: defaultConfig.port,
      db: defaultConfig.db,
    },
  });
});

redis.on('connect', () => {
  logger.info('Redis Client Connected', {
    host: defaultConfig.host,
    port: defaultConfig.port,
    db: defaultConfig.db,
  });
});

redis.on('ready', () => {
  logger.info('Redis Client Ready');
  // Test connection
  redis
    .ping()
    .then(() => {
      logger.info('Redis PING successful');
    })
    .catch((err) => {
      logger.error('Redis PING failed:', { error: formatError(err) });
    });
});

redis.on('reconnecting', () => {
  logger.warn('Redis Client Reconnecting', {
    host: defaultConfig.host,
    port: defaultConfig.port,
  });
});

/**
 * Redis Client with production-ready error handling and type support
 */
export const client = {
  /**
   * Get a value from Redis
   * @param type - The type of value to retrieve (string, number, json)
   * @param key - The key to get
   * @returns The value or null if not found
   */
  async get(type: SupportedTypeEnum, key: string) {
    try {
      const value = await redis.get(key);
      if (!value) return null;

      switch (type) {
        case 'number':
          return Number(value);
        case 'json':
          return JSON.parse(value);
        case 'string':
        default:
          return value;
      }
    } catch (error) {
      logger.error(`Redis GET failed for key: ${key}`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
      return null;
    }
  },

  /**
   * Set a value in Redis
   * @param type - The type of value (string, number, json)
   * @param key - The key to set
   * @param value - The value to set
   * @param ttl - Optional TTL in seconds
   */
  async set(
    type: SupportedTypeEnum,
    key: string,
    value: unknown,
    ttl?: number,
  ) {
    try {
      const stringValue =
        type === 'json' ? JSON.stringify(value) : String(value);

      if (ttl) {
        await redis.setex(key, ttl, stringValue);
      } else {
        await redis.set(key, stringValue);
      }

      return true;
    } catch (error) {
      logger.error(`Redis SET failed for key: ${key}`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
      return false;
    }
  },

  /**
   * Delete a key from Redis
   * @param key - The key to delete
   */
  async delete(key: string) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DELETE failed for key: ${key}`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
      return false;
    }
  },

  /**
   * Check if a key exists in Redis
   * @param key - The key to check
   */
  async exists(key: string) {
    try {
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(`Redis EXISTS failed for key: ${key}`, {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
      return false;
    }
  },

  /**
   * Set multiple values in Redis
   * @param values - Array of {key, value, type} objects
   * @param ttl - Optional TTL in seconds for all values
   */
  async mset(
    values: Array<{ key: string; value: unknown; type: SupportedTypeEnum }>,
    ttl?: number,
  ) {
    const multi = redis.multi();

    try {
      for (const { key, value, type } of values) {
        const stringValue =
          type === 'json' ? JSON.stringify(value) : String(value);
        if (ttl) {
          multi.setex(key, ttl, stringValue);
        } else {
          multi.set(key, stringValue);
        }
      }

      await multi.exec();
      return true;
    } catch (error) {
      logger.error('Redis MSET failed', {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
      return false;
    }
  },

  /**
   * Get multiple values from Redis
   * @param keys - Array of keys to get
   * @param type - The type of values to retrieve
   */
  async mget(keys: string[], type: SupportedTypeEnum) {
    try {
      const values = await redis.mget(keys);

      return values.map((value) => {
        if (!value) return null;

        switch (type) {
          case 'number':
            return Number(value);
          case 'json':
            return JSON.parse(value);
          case 'string':
          default:
            return value;
        }
      });
    } catch (error) {
      logger.error('Redis MGET failed', {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
      return keys.map(() => null);
    }
  },

  /**
   * Get the Redis client instance for advanced operations
   */
  getClient() {
    return redis;
  },
};
