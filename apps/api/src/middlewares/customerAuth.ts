import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';

export interface CustomerAuthRequest extends Request {
  customer?: {
    customerId: string;
    email: string;
    type: string;
  };
}

export function authenticateCustomer(
  req: CustomerAuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.customerToken) {
      token = req.cookies.customerToken;
    }

    if (!token) {
      throw new UnauthorizedError('Customer authentication required');
    }

    const payload = jwt.verify(token, config.jwt.secret) as {
      customerId: string;
      email: string;
      type: string;
    };

    if (payload.type !== 'customer' || !payload.customerId) {
      throw new UnauthorizedError('Invalid customer token');
    }

    req.customer = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid or expired customer token'));
    } else {
      next(error);
    }
  }
}

// Optional customer auth: populates req.customer if valid token present, but does not block if absent
export function optionalCustomerAuth(
  req: CustomerAuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.customerToken) {
      token = req.cookies.customerToken;
    }

    if (token) {
      const payload = jwt.verify(token, config.jwt.secret) as any;
      if (payload.type === 'customer' && payload.customerId) {
        req.customer = payload;
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}
