import { Request, Response, NextFunction } from 'express';
import { publicService } from '../services/public.service';

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

  async sitemap(_req: Request, res: Response, next: NextFunction) {
    try {
      const sitemapData = await publicService.getSitemapData();
      res.status(200).json({
        success: true,
        data: sitemapData,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const publicController = new PublicController();
