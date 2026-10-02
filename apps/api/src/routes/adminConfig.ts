import { Router } from 'express';
import {
  CountryController,
  CurrencyController,
  PropertyTypeController,
  ListingTypeController,
  TenureTypeController,
  PropertyStatusController,
  PropertyFeatureController,
  LeadSourceController,
  LeadStageController,
} from '../controllers/adminConfig.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createCountrySchema,
  updateCountrySchema,
  createCurrencySchema,
  updateCurrencySchema,
  createPropertyTypeSchema,
  updatePropertyTypeSchema,
  createListingTypeSchema,
  updateListingTypeSchema,
  createTenureTypeSchema,
  updateTenureTypeSchema,
  createPropertyStatusSchema,
  updatePropertyStatusSchema,
  createPropertyFeatureSchema,
  updatePropertyFeatureSchema,
  createLeadSourceSchema,
  updateLeadSourceSchema,
  createLeadStageSchema,
  updateLeadStageSchema,
  reorderSchema,
} from '../validators/adminConfig.validator';

export const adminConfigRouter = Router();

// Gated for authenticated admins only
adminConfigRouter.use(authenticate, requireRole('admin'));

// --- Countries ---
adminConfigRouter.get('/countries', CountryController.list);
adminConfigRouter.get('/countries/:id', CountryController.getById);
adminConfigRouter.post('/countries', validate(createCountrySchema), CountryController.create);
adminConfigRouter.put('/countries/:id', validate(updateCountrySchema), CountryController.update);
adminConfigRouter.delete('/countries/:id', CountryController.delete);
adminConfigRouter.patch('/countries/:id/toggle-active', CountryController.toggleActive);

// --- Currencies ---
adminConfigRouter.get('/currencies', CurrencyController.list);
adminConfigRouter.get('/currencies/:id', CurrencyController.getById);
adminConfigRouter.post('/currencies', validate(createCurrencySchema), CurrencyController.create);
adminConfigRouter.put('/currencies/:id', validate(updateCurrencySchema), CurrencyController.update);
adminConfigRouter.delete('/currencies/:id', CurrencyController.delete);
adminConfigRouter.patch('/currencies/:id/set-default', CurrencyController.setDefault);

// Helper for standard reorderable config entity routes
const mountConfigEntity = (
  path: string,
  controller: any,
  createSchema: any,
  updateSchema: any,
) => {
  adminConfigRouter.get(`/${path}`, controller.list);
  adminConfigRouter.get(`/${path}/:id`, controller.getById);
  adminConfigRouter.post(`/${path}`, validate(createSchema), controller.create);
  adminConfigRouter.put(`/${path}/:id`, validate(updateSchema), controller.update);
  adminConfigRouter.delete(`/${path}/:id`, controller.delete);
  adminConfigRouter.patch(`/${path}/reorder`, validate(reorderSchema), controller.reorder);
};

mountConfigEntity('property-types', PropertyTypeController, createPropertyTypeSchema, updatePropertyTypeSchema);
mountConfigEntity('listing-types', ListingTypeController, createListingTypeSchema, updateListingTypeSchema);
mountConfigEntity('tenure-types', TenureTypeController, createTenureTypeSchema, updateTenureTypeSchema);
mountConfigEntity('property-statuses', PropertyStatusController, createPropertyStatusSchema, updatePropertyStatusSchema);
mountConfigEntity('property-features', PropertyFeatureController, createPropertyFeatureSchema, updatePropertyFeatureSchema);
mountConfigEntity('lead-sources', LeadSourceController, createLeadSourceSchema, updateLeadSourceSchema);
mountConfigEntity('lead-stages', LeadStageController, createLeadStageSchema, updateLeadStageSchema);
