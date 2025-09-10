import { USER_ROLE } from '@/constants/enum';
import jwt from 'jsonwebtoken';
import config from '@/config/config';
import { client } from '@/services/redis';
import { middlewareErrors } from './api-error';
import { SupportedType } from '@/types';

// Define token types
export interface TokenPayload {
  id: string;
  role: USER_ROLE;
  email?: string;
  exp?: number;
  iat?: number;
  jti?: string; // JWT ID for token tracking
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Constants
const TOKEN_PREFIX = {
  ACCESS: 'access:',
  REFRESH: 'refresh:',
  BLACKLIST: 'blacklist:',
} as const;

/**
 * Generate a JWT token
 * @param payload - Data to be encoded in the token
 * @param secret - Secret key for signing the token
 * @param expiresIn - Token expiration time in minutes/days
 * @returns Promise<string> - Generated token
 */
export function generateJwtToken(
  payload: TokenPayload,
  secret: string,
  expiresIn: number,
): string {
  const jti = generateTokenId();
  return jwt.sign({ ...payload, jti }, secret, {
    expiresIn: expiresIn < 24 * 60 ? `${expiresIn}m` : `${expiresIn}d`,
    algorithm: 'HS512',
    issuer: 'jal-shakti-api',
    audience: 'jal-shakti-client',
  });
}

/**
 * Verify and decode a JWT token
 * @param token - Token to verify
 * @param secret - Secret key used to sign the token
 * @returns Promise<TokenPayload>
 */
export async function verifyJwtToken(
  token: string,
  secret: string,
): Promise<TokenPayload> {
  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'jal-shakti-api',
      audience: 'jal-shakti-client',
      algorithms: ['HS512'],
    }) as TokenPayload;

    // Check if token is blacklisted
    if (decoded.jti) {
      const isBlacklisted = await isTokenBlacklisted(decoded.jti);
      if (isBlacklisted) {
        throw middlewareErrors.invalidToken();
      }
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw middlewareErrors.expiredToken();
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw middlewareErrors.invalidToken();
    }
    throw error;
  }
}

/**
 * Store refresh token in Redis
 */
export const storeRefreshToken = async (
  userId: string,
  token: string,
): Promise<void> => {
  const key = `${TOKEN_PREFIX.REFRESH}${userId}`;

  await client.set(
    SupportedType.STRING,
    key,
    token,
    config.jwt.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60,
  );
};

/**
 * Validate stored refresh token
 */
export const validateStoredRefreshToken = async (
  userId: string,
  token: string,
): Promise<boolean> => {
  const storedToken = await client.get(
    SupportedType.STRING,
    `${TOKEN_PREFIX.REFRESH}${userId}`,
  );
  return storedToken === token;
};

/**
 * Blacklist a token
 */
export const blacklistToken = async (
  jti: string,
  expiresIn: number,
): Promise<void> => {
  const key = `${TOKEN_PREFIX.BLACKLIST}${jti}`;
  await client.set(SupportedType.STRING, key, '1', expiresIn);
};

/**
 * Check if token is blacklisted
 */
export const isTokenBlacklisted = async (jti: string): Promise<boolean> => {
  const exists = await client.get(
    SupportedType.STRING,
    `${TOKEN_PREFIX.BLACKLIST}${jti}`,
  );
  return Boolean(exists);
};

/**
 * Generate a unique token ID
 */
export const generateTokenId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Extract token from authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string => {
  if (!authHeader) {
    throw middlewareErrors.missingToken();
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    throw middlewareErrors.invalidToken();
  }

  return token;
};

/**
 * Delete refresh token from Redis
 */
export const deleteRefreshToken = async (userId: string): Promise<void> => {
  const key = `${TOKEN_PREFIX.REFRESH}${userId}`;
  await client.delete(key);
};
