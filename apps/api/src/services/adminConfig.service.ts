import { Model } from 'mongoose';
import {
  CountryModel,
  CurrencyModel,
  PropertyTypeModel,
  ListingTypeModel,
  TenureTypeModel,
  PropertyStatusModel,
  PropertyFeatureModel,
  LeadSourceModel,
  LeadStageModel,
} from '../models';
import { NotFoundError } from '../utils/errors';

export class AdminConfigService {
  constructor(protected model: Model<any>) {}

  async list(query = {}) {
    const schemaPaths = Object.keys(this.model.schema.paths);
    const sortParams: any = {};
    if (schemaPaths.includes('sortOrder')) sortParams.sortOrder = 1;
    if (schemaPaths.includes('name')) sortParams.name = 1;

    return this.model.find(query).sort(sortParams);
  }

  async getById(id: string) {
    const item = await this.model.findById(id);
    if (!item) throw new NotFoundError(`${this.model.modelName} not found`);
    return item;
  }

  async create(data: any) {
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (!data.code && data.name) {
      data.code = data.name.toUpperCase().trim().replace(/[^A-Z0-9]+/g, '_').replace(/(^_|_$)+/g, '');
    }
    if (data.currency === '' || (typeof data.currency === 'string' && data.currency.length !== 24)) {
      delete data.currency;
    }
    return this.model.create(data);
  }

  async update(id: string, data: any) {
    const item = await this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!item) throw new NotFoundError(`${this.model.modelName} not found`);
    return item;
  }

  async delete(id: string) {
    const item = await this.model.findByIdAndDelete(id);
    if (!item) throw new NotFoundError(`${this.model.modelName} not found`);
    return item;
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { sortOrder: item.sortOrder },
      },
    }));
    await this.model.bulkWrite(bulkOps);
  }
}

class CountryServiceClass extends AdminConfigService {
  constructor() {
    super(CountryModel);
  }

  override async list(query = {}) {
    return this.model.find(query).populate('currency').sort({ name: 1 });
  }

  async toggleActive(id: string) {
    const item = await this.getById(id);
    item.isActive = !item.isActive;
    await item.save();
    return item;
  }
}

class CurrencyServiceClass extends AdminConfigService {
  constructor() {
    super(CurrencyModel);
  }

  async setDefault(id: string) {
    await this.model.updateMany({}, { isDefault: false });
    const item = await this.update(id, { isDefault: true, isActive: true });
    return item;
  }
}

export const CountryService = new CountryServiceClass();
export const CurrencyService = new CurrencyServiceClass();
export const PropertyTypeService = new AdminConfigService(PropertyTypeModel);
export const ListingTypeService = new AdminConfigService(ListingTypeModel);
export const TenureTypeService = new AdminConfigService(TenureTypeModel);
export const PropertyStatusService = new AdminConfigService(PropertyStatusModel);
export const PropertyFeatureService = new AdminConfigService(PropertyFeatureModel);
export const LeadSourceService = new AdminConfigService(LeadSourceModel);
export const LeadStageService = new AdminConfigService(LeadStageModel);
