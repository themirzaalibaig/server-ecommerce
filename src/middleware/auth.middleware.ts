import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, UserDocument } from '../models/user.model';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';
import {
  JWTPayload,
  verifyToken,
  generateToken as generateJWT,
} from '../config/jwt';

/**
 * Extended Request Interface with User
 */
export interface AuthRequest extends Request {
  user?: UserDocument;
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      ResponseUtil.unauthorized(
        res,
        'Authentication required. Please provide a valid token'
      );
      return;
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      logger.warn('Authentication failed: Empty token', {
        path: req.path,
        method: req.method,
      });
      ResponseUtil.unauthorized(res, 'Authentication token is missing');
      return;
    }

    let decoded: JWTPayload;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Authentication failed: Token expired', {
          path: req.path,
          expiredAt: error.expiredAt,
        });
        ResponseUtil.unauthorized(res, 'Token has expired. Please login again');
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Authentication failed: Invalid token', {
          path: req.path,
          error: error.message,
        });
        ResponseUtil.unauthorized(res, 'Invalid token. Please login again');
        return;
      }
      throw error;
    }

    // Find user by ID
    const user = await UserModel.findById(decoded.userId).select('+password');

    if (!user) {
      logger.warn('Authentication failed: User not found', {
        userId: decoded.userId,
        path: req.path,
      });
      ResponseUtil.unauthorized(res, 'User not found. Please login again');
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Authentication failed: User account is inactive', {
        userId: user._id,
        path: req.path,
      });
      ResponseUtil.forbidden(res, 'Your account has been deactivated');
      return;
    }

    // Attach user to request
    (req as AuthRequest).user = user;

    logger.info('User authenticated successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.error('Authentication middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      method: req.method,
    });
    ResponseUtil.internalError(res, 'Authentication failed');
  }
};

/**
 * Generate JWT Token for User
 */
export const generateToken = (user: UserDocument): string => {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  return generateJWT(payload);
};
