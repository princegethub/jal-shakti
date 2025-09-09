import axios, { AxiosError } from 'axios';
import { StoreTypeEnum, StoreType, SupportedTypeEnum } from '@/types';
import config from '@/config/config';
import { logger } from '@/logger/logger';

const REDIS_URL = config.redis.url || 'http://localhost:6379'; // If using sidecar HTTP interface

/**
 * Sanitizes an error object for safe structured logging.
 */
const sanitizeError = (error: unknown): object => {
  if (error instanceof AxiosError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    };
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { message: 'Unknown error', raw: error };
};

/**
 * KV Store Client – interacts with a sidecar service (HTTP wrapper for Redis).
 */
export const client = {
  async get(
    type: SupportedTypeEnum,
    key: string,
    store: StoreTypeEnum = StoreType.REDIS,
  ) {
    try {
      const { data } = await axios.get(`${REDIS_URL}/${store}/${key}/${type}`);
      return data?.data ?? null;
    } catch (error) {
      logger.error(`Store GET failed for key: ${key}`, {
        error: sanitizeError(error),
      });
      return null;
    }
  },

  async set(
    type: SupportedTypeEnum,
    key: string,
    value: unknown,
    ttl?: number,
    store: StoreTypeEnum = StoreType.REDIS,
  ) {
    try {
      await axios.post(
        `${REDIS_URL}/${store}/${key}/${type}`,
        { key, value, ttl },
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (error) {
      logger.error(`Store SET failed for key: ${key}`, {
        error: sanitizeError(error),
      });
    }
  },

  async delete(key: string, store: StoreTypeEnum = StoreType.REDIS) {
    try {
      await axios.delete(`${REDIS_URL}/${store}/${key}`);
    } catch (error) {
      logger.error(`Store DELETE failed for key: ${key}`, {
        error: sanitizeError(error),
      });
    }
  },
};
