import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserModel } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: string;
    team?: string;
    permissions: string[];
    countryAccess: string[];
    propertyTypeAccess: string[];
    featureAccess: string[];
    propertyAccessScope: any;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      role: string;
    };

    const user = await UserModel.findById(decoded.userId).select(
      '-passwordHash -__v',
    );

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      team: user.team,
      permissions: user.permissions,
      countryAccess: user.countryAccess.map((id: any) => id.toString()),
      propertyTypeAccess: user.propertyTypeAccess.map((id: any) => id.toString()),
      featureAccess: user.featureAccess,
      propertyAccessScope: user.propertyAccessScope,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient role'));
    }
    next();
  };
};

export const requirePermission = (...permissions: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }
    const hasPermission = permissions.every((p) =>
      req.user!.permissions.includes(p),
    );
    if (!hasPermission) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
};

export const requireFeature = (feature: string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    // Admin has all features
    if (req.user.role === 'admin') {
      return next();
    }
    if (!req.user.featureAccess.includes(feature)) {
      return next(new ForbiddenError(`Feature '${feature}' is not enabled for your account`));
    }
    next();
  };
};
