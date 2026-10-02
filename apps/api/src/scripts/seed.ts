import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';
import {
  CurrencyModel,
  CountryModel,
  PropertyTypeModel,
  ListingTypeModel,
  TenureTypeModel,
  PropertyStatusModel,
  PropertyFeatureModel,
  LeadSourceModel,
  LeadStageModel,
} from '../models';

export async function seedDatabase() {
  try {
    logger.info('Connecting to MongoDB for seeding...');
    await mongoose.connect(config.mongodb.uri);

    // 1. Currencies
    const currencyCount = await CurrencyModel.countDocuments();
    let eurId: mongoose.Types.ObjectId | undefined;
    if (currencyCount === 0) {
      const currencies = await CurrencyModel.insertMany([
        { code: 'EUR', symbol: '€', name: 'Euro', isActive: true, isDefault: true },
        { code: 'GBP', symbol: '£', name: 'British Pound', isActive: true, isDefault: false },
        { code: 'USD', symbol: '$', name: 'US Dollar', isActive: true, isDefault: false },
        { code: 'AED', symbol: 'AED', name: 'UAE Dirham', isActive: true, isDefault: false },
      ]);
      eurId = currencies.find((c) => c.code === 'EUR')?._id as mongoose.Types.ObjectId;
      logger.info(`Seeded ${currencies.length} currencies`);
    } else {
      const eur = await CurrencyModel.findOne({ code: 'EUR' });
      eurId = eur?._id as mongoose.Types.ObjectId;
    }

    // 2. Countries
    const countryCount = await CountryModel.countDocuments();
    if (countryCount === 0 && eurId) {
      const countries = await CountryModel.insertMany([
        { name: 'Ireland', isoCode: 'IE', currency: eurId, timezone: 'Europe/Dublin', phoneCode: '+353', isActive: true },
        { name: 'United Kingdom', isoCode: 'GB', timezone: 'Europe/London', phoneCode: '+44', isActive: true },
        { name: 'United Arab Emirates', isoCode: 'AE', timezone: 'Asia/Dubai', phoneCode: '+971', isActive: true },
      ]);
      logger.info(`Seeded ${countries.length} countries`);
    }

    // 3. Property Types
    if ((await PropertyTypeModel.countDocuments()) === 0) {
      const types = [
        { name: 'Apartment', slug: 'apartment', sortOrder: 1 },
        { name: 'House', slug: 'house', sortOrder: 2 },
        { name: 'Villa', slug: 'villa', sortOrder: 3 },
        { name: 'Penthouse', slug: 'penthouse', sortOrder: 4 },
        { name: 'Duplex', slug: 'duplex', sortOrder: 5 },
        { name: 'Commercial', slug: 'commercial', sortOrder: 6 },
        { name: 'Office', slug: 'office', sortOrder: 7 },
        { name: 'Land', slug: 'land', sortOrder: 8 },
      ];
      await PropertyTypeModel.insertMany(types);
      logger.info(`Seeded ${types.length} property types`);
    }

    // 4. Listing Types
    if ((await ListingTypeModel.countDocuments()) === 0) {
      const listingTypes = [
        { name: 'For Sale', slug: 'for-sale', sortOrder: 1 },
        { name: 'For Rent', slug: 'for-rent', sortOrder: 2 },
        { name: 'Short Let', slug: 'short-let', sortOrder: 3 },
        { name: 'Commercial Lease', slug: 'commercial-lease', sortOrder: 4 },
      ];
      await ListingTypeModel.insertMany(listingTypes);
      logger.info(`Seeded ${listingTypes.length} listing types`);
    }

    // 5. Tenure Types
    if ((await TenureTypeModel.countDocuments()) === 0) {
      const tenures = [
        { name: 'Freehold', slug: 'freehold', sortOrder: 1 },
        { name: 'Leasehold', slug: 'leasehold', sortOrder: 2 },
        { name: 'Share of Freehold', slug: 'share-of-freehold', sortOrder: 3 },
        { name: 'Commonhold', slug: 'commonhold', sortOrder: 4 },
      ];
      await TenureTypeModel.insertMany(tenures);
      logger.info(`Seeded ${tenures.length} tenure types`);
    }

    // 6. Property Statuses
    if ((await PropertyStatusModel.countDocuments()) === 0) {
      const statuses = [
        { name: 'Draft', code: 'DRAFT', color: '#64748B', sortOrder: 1 },
        { name: 'Active', code: 'ACTIVE', color: '#10B981', sortOrder: 2 },
        { name: 'Reserved', code: 'RESERVED', color: '#F59E0B', sortOrder: 3 },
        { name: 'Under Offer', code: 'UNDER_OFFER', color: '#F97316', sortOrder: 4 },
        { name: 'Sold', code: 'SOLD', color: '#EF4444', sortOrder: 5 },
        { name: 'Let', code: 'LET', color: '#3B82F6', sortOrder: 6 },
        { name: 'Archived', code: 'ARCHIVED', color: '#334155', sortOrder: 7 },
      ];
      await PropertyStatusModel.insertMany(statuses);
      logger.info(`Seeded ${statuses.length} property statuses`);
    }

    // 7. Property Features
    if ((await PropertyFeatureModel.countDocuments()) === 0) {
      const features = [
        { name: 'Parking', slug: 'parking', sortOrder: 1 },
        { name: 'Balcony', slug: 'balcony', sortOrder: 2 },
        { name: 'Garden', slug: 'garden', sortOrder: 3 },
        { name: 'Central Heating', slug: 'central-heating', sortOrder: 4 },
        { name: 'Double Glazing', slug: 'double-glazing', sortOrder: 5 },
        { name: 'Elevator', slug: 'elevator', sortOrder: 6 },
        { name: 'Sea View', slug: 'sea-view', sortOrder: 7 },
        { name: 'Swimming Pool', slug: 'swimming-pool', sortOrder: 8 },
        { name: 'Gym', slug: 'gym', sortOrder: 9 },
        { name: 'Furnished', slug: 'furnished', sortOrder: 10 },
        { name: 'Air Conditioning', slug: 'air-conditioning', sortOrder: 11 },
        { name: 'Pet Friendly', slug: 'pet-friendly', sortOrder: 12 },
      ];
      await PropertyFeatureModel.insertMany(features);
      logger.info(`Seeded ${features.length} property features`);
    }

    // 8. Lead Sources
    if ((await LeadSourceModel.countDocuments()) === 0) {
      const sources = [
        { name: 'Website', slug: 'website', sortOrder: 1 },
        { name: 'WhatsApp', slug: 'whatsapp', sortOrder: 2 },
        { name: 'Phone', slug: 'phone', sortOrder: 3 },
        { name: 'Walk-in', slug: 'walk-in', sortOrder: 4 },
        { name: 'Daft.ie', slug: 'daft-ie', sortOrder: 5 },
        { name: 'MyHome.ie', slug: 'myhome-ie', sortOrder: 6 },
        { name: 'Referral', slug: 'referral', sortOrder: 7 },
        { name: 'Facebook', slug: 'facebook', sortOrder: 8 },
        { name: 'Instagram', slug: 'instagram', sortOrder: 9 },
        { name: 'Google', slug: 'google', sortOrder: 10 },
      ];
      await LeadSourceModel.insertMany(sources);
      logger.info(`Seeded ${sources.length} lead sources`);
    }

    // 9. Lead Stages
    if ((await LeadStageModel.countDocuments()) === 0) {
      const stages = [
        { name: 'New', code: 'NEW', color: '#3B82F6', sortOrder: 1, isFinal: false },
        { name: 'Contacted', code: 'CONTACTED', color: '#06B6D4', sortOrder: 2, isFinal: false },
        { name: 'Interested', code: 'INTERESTED', color: '#6366F1', sortOrder: 3, isFinal: false },
        { name: 'Qualified', code: 'QUALIFIED', color: '#8B5CF6', sortOrder: 4, isFinal: false },
        { name: 'Property Matched', code: 'PROPERTY_MATCHED', color: '#F59E0B', sortOrder: 5, isFinal: false },
        { name: 'Viewing Scheduled', code: 'VIEWING', color: '#F97316', sortOrder: 6, isFinal: false },
        { name: 'Offer Submitted', code: 'OFFER', color: '#EC4899', sortOrder: 7, isFinal: false },
        { name: 'Negotiation', code: 'NEGOTIATION', color: '#10B981', sortOrder: 8, isFinal: false },
        { name: 'Converted (Won)', code: 'CONVERTED', color: '#059669', sortOrder: 9, isFinal: true },
        { name: 'Lost', code: 'LOST', color: '#EF4444', sortOrder: 10, isFinal: true },
      ];
      await LeadStageModel.insertMany(stages);
      logger.info(`Seeded ${stages.length} lead stages`);
    }

    logger.info('Database seeding completed successfully.');
  } catch (error) {
    logger.error({ err: error }, 'Seeding failed');
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}
