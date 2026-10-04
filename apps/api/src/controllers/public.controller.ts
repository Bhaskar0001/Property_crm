import { Request, Response, NextFunction } from 'express';
import { publicService } from '../services/public.service';
import { chatService } from '../services/chat.service';

export class PublicController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        search,
        country,
        propertyType,
        listingType,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        features,
        city,
        berRating,
        isFeatured,
        sortBy,
        page,
        limit,
      } = req.query;

      const result = await publicService.listProperties({
        search: search ? String(search) : undefined,
        country: country ? String(country) : undefined,
        propertyType: propertyType ? String(propertyType) : undefined,
        listingType: listingType ? String(listingType) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        features: features ? (features as string) : undefined,
        city: city ? String(city) : undefined,
        berRating: berRating ? String(berRating) : undefined,
        isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
        sortBy: sortBy as any,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
      });

      res.status(200).json({
        success: true,
        data: result.properties,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const result = await publicService.getPropertyBySlug(slug);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async featured(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const properties = await publicService.getFeaturedProperties(limit);
      res.status(200).json({
        success: true,
        data: properties,
      });
    } catch (error) {
      next(error);
    }
  }

  async countries(_req: Request, res: Response, next: NextFunction) {
    try {
      const countries = await publicService.getPublicCountries();
      res.status(200).json({
        success: true,
        data: countries,
      });
    } catch (error) {
      next(error);
    }
  }

  async currencies(_req: Request, res: Response, next: NextFunction) {
    try {
      const currencies = await publicService.getPublicCurrencies();
      res.status(200).json({
        success: true,
        data: currencies,
      });
    } catch (error) {
      next(error);
    }
  }

  async propertyTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const types = await publicService.getPublicPropertyTypes();
      res.status(200).json({
        success: true,
        data: types,
      });
    } catch (error) {
      next(error);
    }
  }

  async listingTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const types = await publicService.getPublicListingTypes();
      res.status(200).json({
        success: true,
        data: types,
      });
    } catch (error) {
      next(error);
    }
  }

  async features(_req: Request, res: Response, next: NextFunction) {
    try {
      const features = await publicService.getPublicFeatures();
      res.status(200).json({
        success: true,
        data: features,
      });
    } catch (error) {
      next(error);
    }
  }

  async sitemap(req: Request, res: Response, next: NextFunction) {
    try {
      const baseUrl = process.env.PUBLIC_WEBSITE_URL || `${req.protocol}://${req.get('host')}`;
      const wantsXml = req.path.endsWith('.xml') || req.query.format === 'xml' || req.headers.accept?.includes('application/xml');

      if (wantsXml) {
        const xml = await publicService.getSitemapXml(baseUrl);
        res.setHeader('Content-Type', 'application/xml');
        return res.status(200).send(xml);
      }

      const sitemapData = await publicService.getSitemapData(baseUrl);
      res.status(200).json({
        success: true,
        data: sitemapData,
      });
    } catch (error) {
      next(error);
    }
  }

  async robots(req: Request, res: Response, next: NextFunction) {
    try {
      const baseUrl = process.env.PUBLIC_WEBSITE_URL || `${req.protocol}://${req.get('host')}`;
      const robots = publicService.getRobotsTxt(baseUrl);
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(robots);
    } catch (error) {
      next(error);
    }
  }

  async trackInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyId, channel, customerName, customerPhone, customerEmail } = req.body;
      const result = await publicService.trackInquiry({
        propertyId,
        channel: channel || 'website',
        customerName,
        customerPhone,
        customerEmail,
      });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await publicService.submitOffer(req.body);
      res.status(201).json({
        success: true,
        message: 'Your purchase offer has been registered and submitted to the listing agent.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async requestValuation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await publicService.requestValuation(req.body);
      res.status(201).json({
        success: true,
        message: 'Your valuation appraisal request has been submitted. An advisory specialist will contact you shortly.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getContactInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await chatService.getAdvisoryContactInfo();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, conversationHistory } = req.body;
      const result = await chatService.processPublicChat(message, conversationHistory || []);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const publicController = new PublicController();
