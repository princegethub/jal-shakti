import { EventBus } from './event-bus';
import {
  EventType,
  AuthEventType,
  AuthEventPayload,
} from '@/types/event.types';
import logger from '@/logger/logger';

export class AuthEventHandler {
  private eventBus: EventBus;

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  public async initialize(): Promise<void> {
    // Subscribe to auth events
    await this.eventBus.subscribe<AuthEventPayload>(
      EventType.AUTH,
      AuthEventType.LOGIN_SUCCESS,
      this.handleLoginSuccess.bind(this),
    );

    await this.eventBus.subscribe<AuthEventPayload>(
      EventType.AUTH,
      AuthEventType.LOGIN_FAILED,
      this.handleLoginFailed.bind(this),
    );
  }

  private async handleLoginSuccess(payload: AuthEventPayload): Promise<void> {
    try {
      logger.info('Successful login:', {
        userId: payload.userId,
        ip: payload.ip,
        userAgent: payload.userAgent,
        timestamp: payload.timestamp?.toISOString(),
      });

      // Here you can add additional logic like:
      // - Update last login timestamp
      // - Send login notification
      // - Track user session
      // - Update security logs
    } catch (error) {
      logger.error('Error handling login success event:', { error, payload });
    }
  }

  private async handleLoginFailed(payload: AuthEventPayload): Promise<void> {
    try {
      logger.warn('Failed login attempt:', {
        userId: payload.userId,
        ip: payload.ip,
        userAgent: payload.userAgent,
        reason: payload.metadata?.reason,
        timestamp: payload.timestamp?.toISOString(),
      });

      // Here you can add additional logic like:
      // - Increment failed login counter
      // - Implement temporary account lockout
      // - Send security alerts
      // - Log security events
    } catch (error) {
      logger.error('Error handling login failed event:', { error, payload });
    }
  }
}
