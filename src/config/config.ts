import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';
import { commonErrors } from '@/utils/api-error';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test')
      .required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(10),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10),
    JWT_REFRESH_SECRET: Joi.string()
      .required()
      .description('JWT refresh secret key'),
    LOG_DIR: Joi.string().optional(),
    LOG_APP_NAME: Joi.string().default('jal-shakti'),
    APP_ENV: Joi.string().optional(),
    DEFAULT_PASSWORD: Joi.string().optional(),
    REDIS_PASSWORD: Joi.string().allow('').optional(),
    REDIS_TOKEN_EXPIRY: Joi.number().default(86400), // 24 hours in seconds
    REDIS_URL: Joi.string().optional().default('redis://localhost:6379'),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_DB: Joi.number().default(0),
    REDIS_USERNAME: Joi.string().optional(),
    REDIS_KEY_PREFIX: Joi.string().optional(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.validate(process.env, {
  errors: { label: 'key' },
});

if (error) {
  throw commonErrors.configError(error);
}

const defaultConfig = {
  LOG_APP_NAME: envVars.LOG_APP_NAME,
  LOG_DIR: envVars.LOG_DIR,
};

const configs = {
  development: {
    ...defaultConfig,
    LOG_DIR: defaultConfig.LOG_DIR ?? `./logs/${defaultConfig.LOG_APP_NAME}`,
  },
  test: {
    ...defaultConfig,
    APP_ENV: envVars.APP_ENV ?? 'test',
    LOG_DIR:
      envVars.LOG_DIR ??
      `/var/logs/jal-shakti-logs/${defaultConfig.LOG_APP_NAME}`,
  },
  production: {
    ...defaultConfig,
    LOG_DIR:
      defaultConfig.LOG_DIR ??
      `./var/logs/jal-shakti-logs/${defaultConfig.LOG_APP_NAME}`,
  },
};

const env = (envVars.NODE_ENV || 'development') as keyof typeof configs;

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL,
  },
  jwt: {
    JWT_SECRET: envVars.JWT_SECRET,
    JWT_ACCESS_EXPIRATION_MINUTES: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    JWT_REFRESH_EXPIRATION_DAYS: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES:
      envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    JWT_REFRESH_SECRET: envVars.JWT_REFRESH_SECRET,
  },
  logger: {
    appName: defaultConfig.LOG_APP_NAME || 'jal-shakti',
    logDir: defaultConfig.LOG_DIR || './logs/jal-shakti',
    logLevel: (process.env.LOG_LEVEL as string) || 'info',
    enableConsole:
      process.env.ENABLE_CONSOLE?.toLowerCase() === 'true' ||
      envVars.NODE_ENV === 'development',
    enableFile: true,
    enableMongoDB:
      process.env.ENABLE_MONGODB?.toLowerCase() === 'true' || false,
  },
  redis: {
    url: envVars.REDIS_URL,
    password: envVars.REDIS_PASSWORD || undefined,
    tokenExpiry: envVars.REDIS_TOKEN_EXPIRY,
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    db: envVars.REDIS_DB,
    username: envVars.REDIS_USERNAME || undefined,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'jal-shakti:',
  },
  DEFAULT_USER_PASSWORD: envVars.DEFAULT_PASSWORD || 'jal-shakti@123',
  ...configs[env],
};

export default config;
