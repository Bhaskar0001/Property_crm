import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Staff authentication required for all analytics and import/export endpoints
router.use(authenticate);

// Aggregations
router.get('/dashboard', (req, res, next) => analyticsController.getDashboard(req, res, next));
router.get('/properties', (req, res, next) => analyticsController.getProperties(req, res, next));
router.get('/leads', (req, res, next) => analyticsController.getLeads(req, res, next));
router.get('/staff', (req, res, next) => analyticsController.getStaff(req, res, next));

// Export CSV
router.get('/export/:type', (req, res, next) => analyticsController.exportData(req, res, next));

// Import CSV
router.post('/import/properties', (req, res, next) => analyticsController.importProperties(req, res, next));
router.post('/import/leads', (req, res, next) => analyticsController.importLeads(req, res, next));

export const analyticsRouter = router;
