import { logger } from '@/logger/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { client } from './client';
import { SupportedTypeEnum } from '@/types';

/**
 * Generates a cache key from a request.
 */
type KeyGenerator = (req: Request) => string;

/**
 * Cache middleware options.
 */
interface CacheOptions {
  key: KeyGenerator;
  ttl: number; // seconds
}

/**
 * Default cache middleware options.
 * Default TTL: 5 minutes
 */
export const defaultCacheOptions: CacheOptions = {
  key: (req) => Buffer.from(req.originalUrl).toString('base64'),
  ttl: 300,
};

/**
 * Caching middleware.
 * Checks cache first. If hit, responds immediately. If miss, caches the response.
 */
export const cacheMiddleware =
  (type: SupportedTypeEnum, options: CacheOptions = defaultCacheOptions) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = options.key(req);

    try {
      const cachedData = await client.get(type, cacheKey);

      if (cachedData) {
        logger.info(`Cache HIT: ${cacheKey}`);
        res.status(StatusCodes.OK).json(cachedData);
        return;
      }

      logger.info(`Cache MISS: ${cacheKey}`);

      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        if (res.statusCode === StatusCodes.OK) {
          client.set(type, cacheKey, body, options.ttl);
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${(error as Error).message}`);
      next(); // Never block request due to cache failure
    }
  };

/**
 * Cache invalidation middleware.
 * Invalidates given cache keys after successful response.
 */
export const cacheInvalidate =
  (keys: string[]) => async (_: Request, res: Response, next: NextFunction) => {
    const originalEnd = res.end.bind(res);
    res.end = (chunkOrCb?: unknown, encodingOrCb?: unknown, cb?: unknown) => {
      if (
        res.statusCode >= StatusCodes.OK &&
        res.statusCode < StatusCodes.MULTIPLE_CHOICES
      ) {
        keys.forEach((key) => {
          client.delete(key).catch((err) => {
            logger.error(`Cache invalidate failed for key: ${key}`, err);
          });
        });
      }
      return originalEnd(chunkOrCb, encodingOrCb as 'utf-8', cb as () => void);
    };

    next();
  };
