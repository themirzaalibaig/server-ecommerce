import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Rate Limit Configuration
 */
export const rateLimitConfig = {
  // General API rate limit
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      ResponseUtil.rateLimitExceeded(
        res,
        'Too many requests, please try again later'
      );
    },
  }),

  // Strict rate limit for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count successful requests
    handler: (req: Request, res: Response) => {
      logger.warn('Auth rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      ResponseUtil.rateLimitExceeded(
        res,
        'Too many authentication attempts, please try again in 15 minutes'
      );
    },
  }),

  // Rate limit for password reset
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 requests per hour
    message: 'Too many password reset attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Password reset rate limit exceeded', {
        ip: req.ip,
        path: req.path,
      });
      ResponseUtil.rateLimitExceeded(
        res,
        'Too many password reset attempts, please try again in 1 hour'
      );
    },
  }),

  // Rate limit for creating resources
  create: rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: 'Too many create requests, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Create rate limit exceeded', {
        ip: req.ip,
        path: req.path,
      });
      ResponseUtil.rateLimitExceeded(
        res,
        'Too many requests, please try again in a moment'
      );
    },
  }),

  // Rate limit for file uploads
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 uploads per hour
    message: 'Too many file uploads, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Upload rate limit exceeded', {
        ip: req.ip,
        path: req.path,
      });
      ResponseUtil.rateLimitExceeded(
        res,
        'Upload limit exceeded, please try again later'
      );
    },
  }),

  // Very strict rate limit for admin actions
  admin: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Limit to 30 requests per minute
    message: 'Too many admin requests',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Admin rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        user: (req as any).user?.id,
      });
      ResponseUtil.rateLimitExceeded(
        res,
        'Too many requests, please slow down'
      );
    },
  }),
};

/**
 * Custom rate limiter factory
 * Creates a custom rate limiter with specific settings
 */
export const createRateLimiter = (
  windowMs: number,
  max: number,
  message?: string
) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Custom rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        windowMs,
        max,
      });
      ResponseUtil.rateLimitExceeded(
        res,
        message || 'Too many requests, please try again later'
      );
    },
  });
};
