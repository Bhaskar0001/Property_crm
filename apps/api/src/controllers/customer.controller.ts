import { Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';
import { CustomerAuthRequest } from '../middlewares/customerAuth';
import { UnauthorizedError } from '../utils/errors';

export class CustomerController {
  // Send OTP
  async sendOtp(req: CustomerAuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, name } = req.body;
      const result = await customerService.sendOtp(email, name);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Verify OTP
  async verifyOtp(req: CustomerAuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, otp, name, phone } = req.body;
      const result = await customerService.verifyOtp(email, otp, name, phone);

      // Set cookie for browser sessions
      res.cookie('customerToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(_req: CustomerAuthRequest, res: Response, next: NextFunction) {
    try {
      res.clearCookie('customerToken');
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Get current customer profile
  async getProfile(req: CustomerAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.customer?.customerId) {
        throw new UnauthorizedError('Customer not authenticated');
      }
      const profile = await customerService.getProfile(req.customer.customerId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  // Update profile
  async updateProfile(req: CustomerAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.customer?.customerId) {
        throw new UnauthorizedError('Customer not authenticated');
      }
      const updated = await customerService.updateProfile(req.customer.customerId, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  // Get saved favorites
  async getFavorites(req: CustomerAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.customer?.customerId) {
        throw new UnauthorizedError('Customer not authenticated');
      }
      const favorites = await customerService.getFavorites(req.customer.customerId);
      res.status(200).json({ success: true, data: favorites });
    } catch (error) {
      next(error);
    }
  }

  // Add favorite
  async addFavorite(req: CustomerAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.customer?.customerId) {
        throw new UnauthorizedError('Customer not authenticated');
      }
      const { propertyId } = req.params;
      const result = await customerService.addFavorite(req.customer.customerId, propertyId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Remove favorite
  async removeFavorite(req: CustomerAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.customer?.customerId) {
        throw new UnauthorizedError('Customer not authenticated');
      }
      const { propertyId } = req.params;
      const result = await customerService.removeFavorite(req.customer.customerId, propertyId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Get enquiries & viewings
  async getEnquiries(req: CustomerAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.customer?.customerId) {
        throw new UnauthorizedError('Customer not authenticated');
      }
      const enquiries = await customerService.getEnquiries(req.customer.customerId);
      res.status(200).json({ success: true, data: enquiries });
    } catch (error) {
      next(error);
    }
  }

  // Create an enquiry or viewing request (public or authenticated)
  async createEnquiry(req: CustomerAuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.customerId;
      const { name, email, phone, propertyId, type, scheduledDate, scheduledTime, notes } = req.body;

      const result = await customerService.createEnquiry({
        customerId,
        name,
        email,
        phone,
        propertyId,
        type,
        scheduledDate,
        scheduledTime,
        notes,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Admin: List customers
  async listAdmin(req: any, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const result = await customerService.listAdmin({ page, limit, search });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get customer detail
  async getAdminById(req: any, res: Response, next: NextFunction) {
    try {
      const result = await customerService.getAdminById(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
