import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';
import { Role } from '../types/models';

/**
 * Role-based Access Control Middleware
 * Checks if authenticated user has required role(s)
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    // Check if user is authenticated
    if (!authReq.user) {
      logger.warn('Role check failed: No user attached to request', {
        path: req.path,
        method: req.method,
        requiredRoles: allowedRoles,
      });
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    // Check if user has required role
    if (!allowedRoles.includes(authReq.user.role as Role)) {
      logger.warn('Role check failed: Insufficient permissions', {
        userId: authReq.user._id,
        userRole: authReq.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method,
      });
      ResponseUtil.forbidden(
        res,
        'You do not have permission to access this resource'
      );
      return;
    }

    logger.info('Role check passed', {
      userId: authReq.user._id,
      userRole: authReq.user.role,
      path: req.path,
    });

    next();
  };
};

/**
 * Admin Only Middleware
 * Shorthand for requiring admin role
 */
export const requireAdmin = requireRole(Role.ADMIN);

/**
 * User or Admin Middleware
 * Allows both regular users and admins
 */
export const requireUserOrAdmin = requireRole(Role.USER, Role.ADMIN);

/**
 * Check if user owns the resource
 * Allows access if user is owner or admin
 */
export const requireOwnership = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      logger.warn('Ownership check failed: No user attached to request', {
        path: req.path,
      });
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    // Admins can access everything
    if (authReq.user.role === Role.ADMIN) {
      logger.info('Ownership check bypassed: User is admin', {
        userId: authReq.user._id,
        path: req.path,
      });
      next();
      return;
    }

    // Get resource owner ID from request (params, body, or query)
    const resourceOwnerId =
      req.params[userIdField] ||
      req.body[userIdField] ||
      req.query[userIdField];

    if (!resourceOwnerId) {
      logger.warn('Ownership check failed: No owner ID found in request', {
        userIdField,
        path: req.path,
      });
      ResponseUtil.badRequest(res, 'Resource owner identification is missing');
      return;
    }

    // Check if user owns the resource
    if (authReq.user._id.toString() !== resourceOwnerId.toString()) {
      logger.warn('Ownership check failed: User is not the owner', {
        userId: authReq.user._id,
        resourceOwnerId,
        path: req.path,
      });
      ResponseUtil.forbidden(res, 'You can only access your own resources');
      return;
    }

    logger.info('Ownership check passed', {
      userId: authReq.user._id,
      resourceOwnerId,
      path: req.path,
    });

    next();
  };
};

/**
 * Check if user can modify resource
 * Similar to ownership but allows for different ID field names
 */
export const canModify = (getOwnerId: (req: Request) => string | undefined) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    // Admins can modify everything
    if (authReq.user.role === Role.ADMIN) {
      next();
      return;
    }

    const ownerId = getOwnerId(req);

    if (!ownerId) {
      logger.warn('Modification check failed: Could not determine owner', {
        userId: authReq.user._id,
        path: req.path,
      });
      ResponseUtil.badRequest(res, 'Could not determine resource owner');
      return;
    }

    if (authReq.user._id.toString() !== ownerId.toString()) {
      logger.warn('Modification check failed: User cannot modify resource', {
        userId: authReq.user._id,
        ownerId,
        path: req.path,
      });
      ResponseUtil.forbidden(res, 'You cannot modify this resource');
      return;
    }

    next();
  };
};

/**
 * Check multiple conditions for access
 * More flexible access control
 */
export const checkAccess = (
  condition: (req: AuthRequest) => boolean | Promise<boolean>,
  errorMessage: string = 'Access denied'
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    try {
      const hasAccess = await condition(authReq);

      if (!hasAccess) {
        logger.warn('Access check failed', {
          userId: authReq.user._id,
          path: req.path,
          errorMessage,
        });
        ResponseUtil.forbidden(res, errorMessage);
        return;
      }

      next();
    } catch (error) {
      logger.error('Access check error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: authReq.user._id,
        path: req.path,
      });
      ResponseUtil.internalError(res, 'Failed to verify access permissions');
    }
  };
};
