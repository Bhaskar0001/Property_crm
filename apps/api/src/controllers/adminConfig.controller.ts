import { Request, Response, NextFunction } from 'express';
import {
  CountryService,
  CurrencyService,
  PropertyTypeService,
  ListingTypeService,
  TenureTypeService,
  PropertyStatusService,
  PropertyFeatureService,
  LeadSourceService,
  LeadStageService,
  AdminConfigService,
} from '../services/adminConfig.service';
import { auditService } from '../services/audit.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

const createCrudHandlers = (service: AdminConfigService, entityName: string) => ({
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await service.list();
      sendSuccess(res, items);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await service.getById(req.params.id);
      sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const item = await service.create(req.body);
      if (req.user) {
        await auditService.log({
          userId: req.user._id,
          userName: req.user.name,
          action: `create_${entityName.toLowerCase()}`,
          entity: entityName,
          entityId: item._id.toString(),
          ip: req.ip,
          after: req.body,
        });
      }
      sendCreated(res, item, `${entityName} created successfully`);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const item = await service.update(req.params.id, req.body);
      if (req.user) {
        await auditService.log({
          userId: req.user._id,
          userName: req.user.name,
          action: `update_${entityName.toLowerCase()}`,
          entity: entityName,
          entityId: req.params.id,
          ip: req.ip,
          after: req.body,
        });
      }
      sendSuccess(res, item, `${entityName} updated successfully`);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await service.delete(req.params.id);
      if (req.user) {
        await auditService.log({
          userId: req.user._id,
          userName: req.user.name,
          action: `delete_${entityName.toLowerCase()}`,
          entity: entityName,
          entityId: req.params.id,
          ip: req.ip,
        });
      }
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  },

  reorder: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await service.reorder(req.body.items);
      if (req.user) {
        await auditService.log({
          userId: req.user._id,
          userName: req.user.name,
          action: `reorder_${entityName.toLowerCase()}`,
          entity: entityName,
          entityId: 'bulk',
          ip: req.ip,
          after: req.body,
        });
      }
      sendSuccess(res, null, `${entityName} items reordered successfully`);
    } catch (error) {
      next(error);
    }
  },
});

export const CountryController = {
  ...createCrudHandlers(CountryService, 'Country'),
  toggleActive: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const item = await CountryService.toggleActive(req.params.id);
      sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  },
};

export const CurrencyController = {
  ...createCrudHandlers(CurrencyService, 'Currency'),
  setDefault: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const item = await CurrencyService.setDefault(req.params.id);
      sendSuccess(res, item, 'Default currency updated');
    } catch (error) {
      next(error);
    }
  },
};

export const PropertyTypeController = createCrudHandlers(PropertyTypeService, 'PropertyType');
export const ListingTypeController = createCrudHandlers(ListingTypeService, 'ListingType');
export const TenureTypeController = createCrudHandlers(TenureTypeService, 'TenureType');
export const PropertyStatusController = createCrudHandlers(PropertyStatusService, 'PropertyStatus');
export const PropertyFeatureController = createCrudHandlers(PropertyFeatureService, 'PropertyFeature');
export const LeadSourceController = createCrudHandlers(LeadSourceService, 'LeadSource');
export const LeadStageController = createCrudHandlers(LeadStageService, 'LeadStage');
