import { Request, Response, NextFunction } from 'express';
import { staffService } from '../services/staff.service';
import { auditService } from '../services/audit.service';
import { sendSuccess, sendPaginated, sendCreated } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const staffController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const team = req.query.team as string;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

      const result = await staffService.getAll(page, limit, search, team, isActive);
      sendPaginated(res, result.staff, result.total, page, limit);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await staffService.getById(req.params.id);
      sendSuccess(res, staff);
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = await staffService.create(req.body);
      
      if (req.user) {
        await auditService.log({
          userId: req.user._id,
          userName: req.user.name,
          action: 'create',
          entity: 'User',
          entityId: staff._id.toString(),
          ip: req.ip,
          after: req.body,
        });
      }

      sendCreated(res, staff, 'Staff member created successfully');
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = await staffService.update(req.params.id, req.body);
      
      if (req.user) {
        await auditService.log({
          userId: req.user._id,
          userName: req.user.name,
          action: 'update',
          entity: 'User',
          entityId: staff._id.toString(),
          ip: req.ip,
          after: req.body,
        });
      }

      sendSuccess(res, staff, 'Staff member updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async updatePermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { permissions, countryAccess, propertyTypeAccess, featureAccess, propertyAccessScope } = req.body;
      const staff = await staffService.updatePermissions(
        req.params.id,
        permissions,
        countryAccess,
        propertyTypeAccess,
        featureAccess,
        propertyAccessScope
      );
      
      if (req.user) {
        await auditService.log({
          userId: req.user._id,
          userName: req.user.name,
          action: 'update_permissions',
          entity: 'User',
          entityId: staff._id.toString(),
          ip: req.ip,
          after: req.body,
        });
      }

      sendSuccess(res, staff, 'Permissions updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async activate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = await staffService.activate(req.params.id);
      
      if (req.user) {
        await auditService.log({
          userId: req.user._id,
          userName: req.user.name,
          action: 'activate',
          entity: 'User',
          entityId: staff._id.toString(),
          ip: req.ip,
        });
      }

      sendSuccess(res, staff, 'Staff member activated');
    } catch (error) {
      next(error);
    }
  },

  async deactivate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = await staffService.deactivate(req.params.id);
      
      if (req.user) {
        await auditService.log({
          userId: req.user._id,
          userName: req.user.name,
          action: 'deactivate',
          entity: 'User',
          entityId: staff._id.toString(),
          ip: req.ip,
        });
      }

      sendSuccess(res, staff, 'Staff member deactivated');
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = await staffService.resetPassword(req.params.id, req.body.newPassword);
      
      if (req.user) {
        await auditService.log({
          userId: req.user._id,
          userName: req.user.name,
          action: 'reset_password',
          entity: 'User',
          entityId: staff._id.toString(),
          ip: req.ip,
        });
      }

      sendSuccess(res, staff, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  },
};
