import config from '@/config/config';
import { tryCatchHandler } from '@/utils/try-catch-handler';
import { Request, Response, NextFunction } from 'express';

import ApiError, {
  authErrors,
  commonErrors,
  middlewareErrors,
} from '@/utils/api-error';
import { createUser, getUser } from '@/servies/user-services';
import { successMessages } from '@/utils/api-success';
import {
  generateJwtToken,
  verifyJwtToken,
  validateStoredRefreshToken,
  blacklistToken,
  storeRefreshToken,
  extractTokenFromHeader,
} from '@/utils/jwt';
import jwt from 'jsonwebtoken';
import logger from '@/logger/logger';

export const registerUser = tryCatchHandler(
  async (req: Request, res: Response, _: NextFunction) => {
    try {
      if (!req.body) commonErrors.requestBodyEmpty();

      const {
        name,
        email,
        phone,
        role,
        password = config.DEFAULT_USER_PASSWORD || 'jal-shakti@123',
        isEmailVerified = false,
        location = '',
      } = req.body;

      const where =
        email && phone ? { email, phone } : email ? { email } : { phone };
      // Check if user already exists
      const userExists = await getUser(where);
      if (userExists) throw authErrors.userAlreadyExists();

      // Create user
      const user = await createUser({
        name,
        email,
        phone,
        role,
        password,
        isEmailVerified,
        location,
      });

      logger.info('New user registered', {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
      // Send success response
      return successMessages.userCreated(user).sendResponse(res);
    } catch (error) {
      // If it's already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Convert to API error
      throw commonErrors.somethingWentWrong(error as Error);
    }
  },
);

export const login = tryCatchHandler(async (req: Request, res: Response) => {
  const { email, password, phone } = req.body;

  // Validate if required fields are present
  if (!((email && password) || phone)) {
    throw commonErrors.missingMandatoryField();
  }

  // Determine login method (email or phone)
  const where = email ? { email } : { phone };
  let user = await getUser(where);

  // Validate user existence
  if (!user) {
    throw authErrors.invalidCredentials();
  }

  // Validate password only for email login
  if (email || phone) {
    // If user exists but has no password in DB, throw error
    if (!user.password) {
      throw authErrors.invalidCredentials();
    }

    // If password is provided, validate it
    if (password) {
      const isPasswordValid = await user.isPasswordMatch(password);
      if (!isPasswordValid) {
        throw authErrors.invalidCredentials();
      }
    }
  }

  // Generate tokens
  const payload = { id: user.id, role: user.role, email: user.email };
  const [accessToken, refreshToken] = await Promise.all([
    generateJwtToken(
      payload,
      config.jwt.JWT_SECRET,
      config.jwt.JWT_ACCESS_EXPIRATION_MINUTES,
    ),
    generateJwtToken(
      payload,
      config.jwt.JWT_REFRESH_SECRET,
      config.jwt.JWT_REFRESH_EXPIRATION_DAYS,
    ),
  ]);

  // Store refresh token in Redis
  await storeRefreshToken(user.id, refreshToken);

  // Send success response with tokens
  return successMessages
    .userLoggedIn({
      user,
      accessToken,
      refreshToken,
      expiresIn: config.jwt.JWT_ACCESS_EXPIRATION_MINUTES * 60,
    })
    .sendResponse(res);
});

export const logout = tryCatchHandler(async (req: Request, res: Response) => {
  if (!req.body) commonErrors.requestBodyEmpty();

  const accessToken = extractTokenFromHeader(req.headers.authorization);

  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw middlewareErrors.missingToken();
  }

  try {
    // Verify and decode both tokens
    const [decodedAccess, decodedRefresh] = await Promise.all([
      verifyJwtToken(accessToken.trim(), config.jwt.JWT_SECRET),
      verifyJwtToken(refreshToken.trim(), config.jwt.JWT_REFRESH_SECRET),
    ]);

    // Blacklist both tokens
    await Promise.all([
      decodedAccess.jti &&
        blacklistToken(
          decodedAccess.jti,
          config.jwt.JWT_ACCESS_EXPIRATION_MINUTES * 60,
        ),
      decodedRefresh.jti &&
        blacklistToken(
          decodedRefresh.jti,
          config.jwt.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60,
        ),
      storeRefreshToken(decodedRefresh.id, ''), // Clear refresh token
    ]);

    return successMessages.logout().sendResponse(res);
  } catch (error) {
    // If tokens are invalid or expired, still clear the refresh token
    if (error instanceof jwt.JsonWebTokenError) {
      return successMessages.logout().sendResponse(res);
    }
    throw error;
  }
});

export const refreshToken = tryCatchHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw middlewareErrors.missingToken();
    }

    // Step 1: Verify the refresh token
    const decoded = await verifyJwtToken(
      refreshToken,
      config.jwt.JWT_REFRESH_SECRET,
    );
    // Step 2: Validate the stored refresh token
    const isValid = await validateStoredRefreshToken(decoded.id, refreshToken);
    if (!isValid) {
      throw middlewareErrors.invalidToken();
    }

    // Step 3: Generate new tokens
    const payload = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      generateJwtToken(
        payload,
        config.jwt.JWT_SECRET,
        config.jwt.JWT_ACCESS_EXPIRATION_MINUTES,
      ),
      generateJwtToken(
        payload,
        config.jwt.JWT_REFRESH_SECRET,
        config.jwt.JWT_REFRESH_EXPIRATION_DAYS,
      ),
    ]);

    // Step 4: Blacklist old refresh token
    if (decoded.jti) {
      await blacklistToken(
        decoded.jti,
        config.jwt.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60,
      );
    }

    // Step 5: Store new refresh token
    await storeRefreshToken(decoded.id, newRefreshToken);

    // Step 6: Send new tokens
    return successMessages
      .tokenRefreshed({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: config.jwt.JWT_ACCESS_EXPIRATION_MINUTES * 60,
      })
      .sendResponse(res);
  },
);
