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

    // Default lookup dependencies
    const [defaultCountry, defaultType, defaultStatus, defaultCurrency] = await Promise.all([
      CountryModel.findOne({ isActive: true }),
      PropertyTypeModel.findOne({ isActive: true }),
      PropertyStatusModel.findOne({ code: 'AVAILABLE' }) || PropertyStatusModel.findOne({ isActive: true }),
      CurrencyModel.findOne({ isActive: true }),
    ]);

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const title = row.title || row.Title || row['Property Title'];
      const price = Number(row.price || row.Price || row['Asking Price']);

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

      try {
        await PropertyModel.create({
          title: title.trim(),
          slug: uniqueSlug,
          price,
          currency: defaultCurrency?._id,
          country: defaultCountry?._id,
          propertyType: defaultType?._id,
          status: defaultStatus?._id,
          city: row.city || row.City || 'Dublin',
          area: row.area || row.Area || '',
          bedrooms: Number(row.bedrooms || row.Bedrooms) || undefined,
          bathrooms: Number(row.bathrooms || row.Bathrooms) || undefined,
          livingArea: Number(row.livingArea || row['Living Area']) || undefined,
          isPublished: true,
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
