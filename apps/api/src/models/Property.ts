import mongoose, { Schema, Document } from 'mongoose';
export interface IProperty extends Document {
  title: string; slug: string; description: string;
  country: mongoose.Types.ObjectId; propertyType: mongoose.Types.ObjectId;
  listingType: mongoose.Types.ObjectId; tenureType: mongoose.Types.ObjectId;
  status: mongoose.Types.ObjectId; currency: mongoose.Types.ObjectId;
  price: number; features: mongoose.Types.ObjectId[]; isPublished: boolean;
  createdBy: mongoose.Types.ObjectId; updatedBy: mongoose.Types.ObjectId;
}
const schema = new Schema<IProperty>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  country: { type: Schema.Types.ObjectId, ref: 'Country' },
  propertyType: { type: Schema.Types.ObjectId, ref: 'PropertyType' },
  listingType: { type: Schema.Types.ObjectId, ref: 'ListingType' },
  tenureType: { type: Schema.Types.ObjectId, ref: 'TenureType' },
  status: { type: Schema.Types.ObjectId, ref: 'PropertyStatus' },
  currency: { type: Schema.Types.ObjectId, ref: 'Currency' },
  price: { type: Number },
  features: [{ type: Schema.Types.ObjectId, ref: 'PropertyFeature' }],
  isPublished: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ slug: 1 }); schema.index({ country: 1 }); schema.index({ propertyType: 1 }); schema.index({ status: 1 }); schema.index({ isPublished: 1 }); schema.index({ price: 1 });
export const PropertyModel = mongoose.model<IProperty>('Property', schema);
