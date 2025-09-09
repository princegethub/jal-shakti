import { USER_ROLE } from '@/constants/enum';

export enum EventType {
  USER = 'user',
  AUTH = 'auth',
  NOTIFICATION = 'notification',
  SYSTEM = 'system',
}

export enum UserEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  LOGGED_IN = 'logged_in',
  LOGGED_OUT = 'logged_out',
}

export enum AuthEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  PASSWORD_RESET = 'password_reset',
}

export enum NotificationEventType {
  EMAIL_SENT = 'email_sent',
  SMS_SENT = 'sms_sent',
  PUSH_SENT = 'push_sent',
}

export interface BaseEventPayload {
  id: string;
  timestamp: Date;
  eventType: EventType;
  subType: string;
}

export interface UserEventPayload extends BaseEventPayload {
  eventType: EventType.USER;
  subType: UserEventType;
  userId: string;
  email: string;
  role: USER_ROLE;
  metadata?: Record<string, unknown>;
}

export interface AuthEventPayload extends BaseEventPayload {
  eventType: EventType.AUTH;
  subType: AuthEventType;
  userId: string;
  ip?: string;
  userAgent?: string;
  metadata?: {
    deviceId?: string;
    location?: string;
    success?: boolean;
    reason?: string;
  };
}

export interface NotificationEventPayload extends BaseEventPayload {
  eventType: EventType.NOTIFICATION;
  subType: NotificationEventType;
  userId: string;
  channel: 'email' | 'sms' | 'push';
  status: 'success' | 'failed';
  metadata?: {
    recipient: string;
    templateId?: string;
    error?: string;
  };
}

export type EventPayload =
  | UserEventPayload
  | AuthEventPayload
  | NotificationEventPayload;
