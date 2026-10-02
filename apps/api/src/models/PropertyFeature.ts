import mongoose, { Schema, Document } from 'mongoose';
export interface IPropertyFeature extends Document { name: string; slug: string; icon: string; isActive: boolean; sortOrder: number; }
const schema = new Schema<IPropertyFeature>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export const PropertyFeatureModel = mongoose.model<IPropertyFeature>('PropertyFeature', schema);
