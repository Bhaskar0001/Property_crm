import { Router } from 'express';
import { publicController } from '../controllers/public.controller';
import { currencyService } from '../services/currency.service';

const router = Router();

// Public routes (no authentication required)
router.get('/properties', (req, res, next) => publicController.list(req, res, next));
router.get('/properties/:slug', (req, res, next) => publicController.getBySlug(req, res, next));
router.get('/featured', (req, res, next) => publicController.featured(req, res, next));
router.get('/countries', (req, res, next) => publicController.countries(req, res, next));
router.get('/currencies', (req, res, next) => publicController.currencies(req, res, next));
router.get('/property-types', (req, res, next) => publicController.propertyTypes(req, res, next));
router.get('/listing-types', (req, res, next) => publicController.listingTypes(req, res, next));
router.get('/features', (req, res, next) => publicController.features(req, res, next));
router.get('/sitemap', (req, res, next) => publicController.sitemap(req, res, next));
router.get('/sitemap.xml', (req, res, next) => publicController.sitemap(req, res, next));
router.get('/robots.txt', (req, res, next) => publicController.robots(req, res, next));
router.post('/track-inquiry', (req, res, next) => publicController.trackInquiry(req, res, next));
router.post('/offers', (req, res, next) => publicController.submitOffer(req, res, next));
router.post('/valuation-request', (req, res, next) => publicController.requestValuation(req, res, next));
router.get('/contact-info', (req, res, next) => publicController.getContactInfo(req, res, next));
router.post('/chat', (req, res, next) => publicController.chat(req, res, next));
router.get('/exchange-rates', async (req, res, next) => {
  try {
    const base = (req.query.base as string) || 'EUR';
    const rates = await currencyService.getExchangeRates(base);
    res.json({ success: true, data: { base, rates } });
  } catch (err) {
    next(err);
  }
});

export const publicRouter = router;
