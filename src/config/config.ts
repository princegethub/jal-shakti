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
    LOG_DIR: Joi.string().optional(),
    LOG_APP_NAME: Joi.string().default('jal-shakti'),
    APP_ENV: Joi.string().optional(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.validate(process.env, {
  errors: { label: 'key' },
});

if (error) {
  throw commonErrors.configError;
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
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
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
  ...configs[env],
};

export default config;
