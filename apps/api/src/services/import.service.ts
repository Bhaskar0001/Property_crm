import { PropertyModel } from '../models/Property';
import { CustomerModel } from '../models/Customer';
import { LeadModel } from '../models/Lead';
import { CountryModel } from '../models/Country';
import { PropertyTypeModel } from '../models/PropertyType';
import { PropertyStatusModel } from '../models/PropertyStatus';
import { CurrencyModel } from '../models/Currency';
import { LeadSourceModel } from '../models/LeadSource';
import { LeadStageModel } from '../models/LeadStage';
import { auditService } from './audit.service';
import { ValidationError } from '../utils/errors';

import { ListingTypeModel } from '../models/ListingType';
import { resolveCoordinates } from '../utils/geocoder';
import { getIO } from '../config/socket';

export interface ImportResult {
  success: boolean;
  total: number;
  created: number;
  skipped: number;
  errors: string[];
}

export class ImportService {
  // 1. Bulk Properties Import
  async importProperties(rows: any[], user?: any): Promise<ImportResult> {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ValidationError('Upload must contain at least one valid row');
    }

    // Preload lookups for fast dynamic matching
    const [countries, propertyTypes, listingTypes, statuses, currencies] = await Promise.all([
      CountryModel.find().lean(),
      PropertyTypeModel.find().lean(),
      ListingTypeModel.find().lean(),
      PropertyStatusModel.find().lean(),
      CurrencyModel.find().lean(),
    ]);

    const defaultCountry = countries.find((c) => c.isActive) || countries[0];
    const defaultType = propertyTypes.find((t) => t.isActive) || propertyTypes[0];
    const defaultListing = listingTypes.find((l) => l.isActive) || listingTypes[0];
    const defaultStatus = statuses.find((s) => s.code === 'ACTIVE' || s.code === 'AVAILABLE') || statuses[0];
    const defaultCurrency = currencies.find((c) => c.isDefault) || currencies.find((c) => c.code === 'EUR') || currencies[0];

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const title = row.title || row.Title || row['Property Title'];
      const rawPrice = row.price || row.Price || row['Asking Price'] || row['Price'];
      const price = Number(String(rawPrice).replace(/[^0-9.]/g, ''));

      if (!title || !price || isNaN(price)) {
        errors.push(`Row ${i + 1}: Missing required title or valid numeric price.`);
        skipped++;
        continue;
      }

      // Check if duplicate title exists
      const existing = await PropertyModel.findOne({ title: title.trim(), isDeleted: false });
      if (existing) {
        skipped++;
        continue;
      }

      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

      // Resolve Country
      const rawCountry = (row.country || row.Country || '').trim().toLowerCase();
      const matchedCountry = countries.find(
        (c) =>
          c.name.toLowerCase() === rawCountry ||
          c.isoCode.toLowerCase() === rawCountry ||
          (rawCountry.length > 2 && c.name.toLowerCase().includes(rawCountry))
      ) || defaultCountry;

      // Resolve City & Address
      const city = row.city || row.City || 'Amsterdam';
      const area = row.area || row.Area || '';
      const address = row.address || row.Address || `${area ? area + ', ' : ''}${city}`;

      // Resolve Property Type
      const rawType = (row.propertyType || row['Property Type'] || row.type || row.Type || '').trim().toLowerCase();
      const matchedType = propertyTypes.find(
        (t) =>
          t.name.toLowerCase() === rawType ||
          t.slug.toLowerCase() === rawType ||
          (rawType && t.name.toLowerCase().includes(rawType))
      ) || defaultType;

      // Resolve Listing Type
      const rawListing = (row.listingType || row['Listing Type'] || '').trim().toLowerCase();
      const matchedListing = listingTypes.find(
        (l) =>
          l.name.toLowerCase() === rawListing ||
          l.slug.toLowerCase() === rawListing ||
          (rawListing.includes('rent') && l.slug.includes('rent')) ||
          (rawListing.includes('sale') && l.slug.includes('sale'))
      ) || defaultListing;

      // Resolve Currency
      const rawCurrency = (row.currency || row.Currency || '').trim().toUpperCase();
      const matchedCurrency = currencies.find(
        (c) => c.code === rawCurrency || (rawCurrency === '$' && c.code === 'USD') || (rawCurrency === '€' && c.code === 'EUR') || (rawCurrency === '£' && c.code === 'GBP')
      ) || defaultCurrency;

      // Resolve Coordinates
      let lat = row.latitude !== undefined && row.latitude !== '' ? Number(row.latitude) : undefined;
      let lng = row.longitude !== undefined && row.longitude !== '' ? Number(row.longitude) : undefined;
      if (lat === undefined || isNaN(lat) || lng === undefined || isNaN(lng)) {
        const coords = resolveCoordinates(city, matchedCountry?.name, address);
        lat = coords.latitude;
        lng = coords.longitude;
      }

      // Cover image
      const coverImage = row.coverImage || row.image || row['Cover Image'] || row['Image'] || undefined;

      try {
        await PropertyModel.create({
          title: title.trim(),
          slug: uniqueSlug,
          price,
          currency: matchedCurrency?._id,
          country: matchedCountry?._id,
          propertyType: matchedType?._id,
          listingType: matchedListing?._id,
          status: defaultStatus?._id,
          city,
          area,
          address,
          latitude: lat,
          longitude: lng,
          bedrooms: Number(row.bedrooms || row.Bedrooms) || undefined,
          bathrooms: Number(row.bathrooms || row.Bathrooms) || undefined,
          livingArea: Number(row.livingArea || row['Living Area']) || undefined,
          coverImage,
          description: row.description || row.Description || undefined,
          shortDescription: row.shortDescription || row['Short Description'] || undefined,
          isPublished: true,
          isVisibleInSearch: true,
          createdBy: user?._id,
        });
        created++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: Failed to save: ${err.message}`);
        skipped++;
      }
    }

    await auditService.log({
      userId: user?._id?.toString() || 'SYSTEM',
      userName: user?.name || 'Staff',
      action: 'BULK_IMPORT_PROPERTIES',
      entity: 'Property',
      entityId: 'bulk',
    });

    // Notify all connected clients via Socket.IO
    const io = getIO();
    if (io) {
      io.emit('properties_imported', { created, skipped, total: rows.length });
    }

    return {
      success: true,
      total: rows.length,
      created,
      skipped,
      errors: errors.slice(0, 10), // Limit error message size
    };
  }

  // 2. Bulk Leads Import
  async importLeads(rows: any[], user?: any): Promise<ImportResult> {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ValidationError('Upload must contain at least one valid row');
    }

    const [defaultSource, defaultStage] = await Promise.all([
      LeadSourceModel.findOne({ slug: 'csv_import' }) || LeadSourceModel.findOne({ isActive: true }),
      LeadStageModel.findOne({ code: 'NEW' }) || LeadStageModel.findOne({ isActive: true }),
    ]);

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row.name || row.Name || row['Customer Name'] || 'Prospective Client';
      const email = (row.email || row.Email || '').toLowerCase().trim();
      const phone = (row.phone || row.Phone || row['Mobile Phone'] || '').trim();

      if (!email && !phone) {
        errors.push(`Row ${i + 1}: Must provide at least email or phone.`);
        skipped++;
        continue;
      }

      try {
        // Resolve customer
        let customer: any = null;
        if (email) customer = await CustomerModel.findOne({ email });
        if (!customer && phone) customer = await CustomerModel.findOne({ phone });

        if (!customer) {
          customer = await CustomerModel.create({
            name,
            email: email || `${phone.replace(/[^0-9]/g, '')}@lead-import.local`,
            phone,
            consentGiven: true,
            consentDate: new Date(),
            isActive: true,
          });
        }

        // Avoid creating duplicate lead for same customer within past 3 days
        const recentLead = await LeadModel.findOne({
          customer: customer._id,
          createdAt: { $gte: new Date(Date.now() - 3 * 86400000) },
        });

        if (recentLead) {
          skipped++;
          continue;
        }

        await LeadModel.create({
          customer: customer._id,
          source: defaultSource?._id,
          stage: defaultStage?._id,
          priority: row.priority || 'medium',
          notes: row.notes || row.Notes || 'Imported via CSV batch upload.',
          assignedTo: user?._id,
          lastContactedAt: new Date(),
        });

        created++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
        skipped++;
      }
    }

    await auditService.log({
      userId: user?._id?.toString() || 'SYSTEM',
      userName: user?.name || 'Staff',
      action: 'BULK_IMPORT_LEADS',
      entity: 'Lead',
      entityId: 'bulk',
    });

    return {
      success: true,
      total: rows.length,
      created,
      skipped,
      errors: errors.slice(0, 10),
    };
  }
}

export const importService = new ImportService();
