import { USER_ROLE } from '@/constants/enum';
import jwt from 'jsonwebtoken';

/**
 * Compares a plaintext password with a hashed password to determine if they match.
 *
 * @param password - The plaintext password to compare.
 * @param hash - The hashed password to compare against.
 * @returns A promise that resolves to `true` if the passwords match, otherwise `false`.
 */
// export async function comparePassword(
//     password: string,
//     hash: string,
// ): Promise<boolean> {
//     return await bcrypt.compare(password, hash);
// }

/**
 * Generates a JSON Web Token (JWT) for the given user ID and email.
 *
 * @param id - The unique identifier of the user.
 * @param email - The email address of the user.
 * @param secret - The secret key.
 * @param expiresIn - The expiration time.
 * @returns A signed JWT containing the user's ID and email.
 *
 * @throws An error if the secret or expiration time is not defined.
 */
export function generateJwtToken(
  payload: { id: string; role: USER_ROLE; email: string },
  secret: string,
  expiresIn: number,
): string {
  return jwt.sign(payload, secret as jwt.Secret, {
    expiresIn: expiresIn,
  });
}

/**
 * Verifies a JWT and returns the decoded payload.
 *
 * @param token - The JWT to verify.
 * @param secret - The secret key.
 * @returns The decoded payload of the JWT.
 *
 * @throws An error if the token is invalid or expired.
 */
export function verifyJwtToken(token: string, secret: string): jwt.JwtPayload {
  return jwt.verify(token, secret) as jwt.JwtPayload;
}
