import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authenticateCustomer, optionalCustomerAuth } from '../middlewares/customerAuth';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Staff Admin customer management endpoints
router.get('/', authenticate, (req, res, next) => customerController.listAdmin(req, res, next));
router.get('/detail/:id', authenticate, (req, res, next) => customerController.getAdminById(req, res, next));

// Authentication endpoints
router.post('/auth/send-otp', (req, res, next) => customerController.sendOtp(req, res, next));
router.post('/auth/verify-otp', (req, res, next) => customerController.verifyOtp(req, res, next));
router.post('/auth/logout', (req, res, next) => customerController.logout(req, res, next));

// Customer Profile endpoints
router.get('/me', authenticateCustomer, (req, res, next) => customerController.getProfile(req, res, next));
router.put('/me', authenticateCustomer, (req, res, next) => customerController.updateProfile(req, res, next));

// Saved Favorites endpoints
router.get('/favorites', authenticateCustomer, (req, res, next) => customerController.getFavorites(req, res, next));
router.post('/favorites/:propertyId', authenticateCustomer, (req, res, next) =>
  customerController.addFavorite(req, res, next)
);
router.delete('/favorites/:propertyId', authenticateCustomer, (req, res, next) =>
  customerController.removeFavorite(req, res, next)
);

// Enquiries & Viewings endpoints
router.get('/enquiries', authenticateCustomer, (req, res, next) => customerController.getEnquiries(req, res, next));
router.post('/enquiries', optionalCustomerAuth, (req, res, next) =>
  customerController.createEnquiry(req, res, next)
);

// Customer Offers endpoint
router.get('/offers', authenticateCustomer, (req, res, next) => customerController.getOffers(req, res, next));

export const customerRouter = router;
