import { logger } from '../utils/logger';
import jwt, { SignOptions } from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  token: string;
}

export const generateToken = (payload: JWTPayload): string => {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const token = jwt.sign(
    payload,
    jwtSecret as string,
    { expiresIn: jwtExpiresIn } as SignOptions
  );
  logger.info('Token generated for user', { userId: payload.userId });
  return token;
};

export const verifyToken = (token: string): JWTPayload => {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.verify(token, jwtSecret as string) as JWTPayload;
};

export const decodeToken = (token: string): JWTPayload => {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const decoded = jwt.decode(token) as JWTPayload;
  return decoded;
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = jwt.decode(token) as JWTPayload;
  const currentTime = Date.now() / 1000;
  if (typeof decoded.exp !== 'number') {
    return true;
  }
  return decoded.exp < currentTime;
};

export const isTokenValid = (token: string): boolean => {
  return !isTokenExpired(token);
};
