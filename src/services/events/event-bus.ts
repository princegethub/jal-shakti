import { createClient, RedisClientType } from 'redis';
import config from '@/config/config';
import logger from '@/logger/logger';
import { EventType, EventPayload } from '@/types/event.types';
import crypto from 'crypto';

export class EventBus {
  private static instance: EventBus;
  private publisher: RedisClientType;
  private subscriber: RedisClientType;
  private readonly prefix: string = 'jal-shakti:events';
  private handlers: Map<string, Set<(payload: EventPayload) => Promise<void>>>;
  private isInitialized: boolean = false;

  private constructor() {
    this.handlers = new Map();

    // Create Redis clients
    this.publisher = createClient({
      url: `redis://${config.redis.host}:${config.redis.port}`,
      password: config.redis.password,
    });

    this.subscriber = createClient({
      url: `redis://${config.redis.host}:${config.redis.port}`,
      password: config.redis.password,
    });

    // Setup error handlers
    this.publisher.on('error', (err) => {
      logger.error('Redis Publisher Error:', { error: err });
    });

    this.subscriber.on('error', (err) => {
      logger.error('Redis Subscriber Error:', { error: err });
    });
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  private getEventChannel(eventType: EventType, subType?: string): string {
    return subType
      ? `${this.prefix}:${eventType}:${subType}`
      : `${this.prefix}:${eventType}`;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Connect both clients
      await Promise.all([this.publisher.connect(), this.subscriber.connect()]);

      // Setup message handler
      this.subscriber.on('message', (channel: string, message: string) => {
        try {
          const payload = JSON.parse(message) as EventPayload;
          const handlers = this.handlers.get(channel);

          if (handlers) {
            handlers.forEach((handler) => {
              handler(payload).catch((err) => {
                logger.error('Event handler error:', {
                  error: err,
                  channel,
                  payload,
                });
              });
            });
          }
        } catch (error) {
          logger.error('Error processing event message:', {
            error,
            channel,
            message,
          });
        }
      });

      this.isInitialized = true;
      logger.info(
        `EventBus initialized with redis://${config.redis.host}:${config.redis.port}`,
      );
    } catch (error) {
      logger.error('Failed to initialize EventBus:', { error });
      throw error;
    }
  }

  public async publish<T extends EventPayload>(
    eventType: EventType,
    subType: string,
    payload: Omit<T, 'id' | 'timestamp' | 'eventType' | 'subType'>,
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('EventBus not initialized');
    }

    const fullPayload: T = {
      ...(payload as unknown as Omit<
        T,
        'id' | 'timestamp' | 'eventType' | 'subType'
      >),
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType,
      subType,
    } as T;

    const channel = this.getEventChannel(eventType, subType);

    try {
      await this.publisher.publish(channel, JSON.stringify(fullPayload));
      logger.debug('Event published:', { channel, payload: fullPayload });
    } catch (error) {
      logger.error('Failed to publish event:', {
        error,
        channel,
        payload: fullPayload,
      });
      throw error;
    }
  }

  public async subscribe<T extends EventPayload>(
    eventType: EventType,
    subType: string | null,
    handler: (payload: T) => Promise<void>,
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('EventBus not initialized');
    }

    const channel = this.getEventChannel(eventType, subType || '');

    try {
      // Store handler
      if (!this.handlers.has(channel)) {
        this.handlers.set(channel, new Set());
      }
      const handlersSet = this.handlers.get(channel);
      if (handlersSet) {
        handlersSet.add(
          handler as unknown as (payload: EventPayload) => Promise<void>,
        );
      }

      // Subscribe to channel
      await this.subscriber.subscribe(channel, (message) => {
        const payload = JSON.parse(message) as T;
        handler(payload).catch((err) => {
          logger.error('Event handler error:', {
            error: err,
            channel,
            payload,
          });
        });
      });

      logger.debug('Subscribed to channel:', { channel });
    } catch (error) {
      logger.error('Failed to subscribe to channel:', { error, channel });
      throw error;
    }
  }

  public async unsubscribe(
    eventType: EventType,
    subType: string | null,
    handler?: (payload: EventPayload) => Promise<void>,
  ): Promise<void> {
    const channel = this.getEventChannel(eventType, subType || '');

    try {
      if (handler) {
        // Remove specific handler
        const handlers = this.handlers.get(channel);
        if (handlers) {
          handlers.delete(handler);
          if (handlers.size === 0) {
            await this.subscriber.unsubscribe(channel);
            this.handlers.delete(channel);
          }
        }
      } else {
        // Remove all handlers for this channel
        await this.subscriber.unsubscribe(channel);
        this.handlers.delete(channel);
      }

      logger.debug('Unsubscribed from channel:', { channel });
    } catch (error) {
      logger.error('Failed to unsubscribe from channel:', { error, channel });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await Promise.all([this.publisher.quit(), this.subscriber.quit()]);
      this.isInitialized = false;
      this.handlers.clear();
      logger.info('EventBus disconnected');
    } catch (error) {
      logger.error('Error disconnecting EventBus:', { error });
      throw error;
    }
  }
}
