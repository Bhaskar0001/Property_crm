import { Router } from 'express';
import { publicController } from '../controllers/public.controller';

const router = Router();

// Public routes (no authentication required)
router.get('/properties', (req, res, next) => publicController.list(req, res, next));
router.get('/properties/:slug', (req, res, next) => publicController.getBySlug(req, res, next));
router.get('/featured', (req, res, next) => publicController.featured(req, res, next));
router.get('/countries', (req, res, next) => publicController.countries(req, res, next));
router.get('/property-types', (req, res, next) => publicController.propertyTypes(req, res, next));
router.get('/sitemap', (req, res, next) => publicController.sitemap(req, res, next));

export const publicRouter = router;
