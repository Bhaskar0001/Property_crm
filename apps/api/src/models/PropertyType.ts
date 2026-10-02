import mongoose, { Schema, Document } from 'mongoose';
export interface IPropertyType extends Document { name: string; slug: string; icon: string; description: string; isActive: boolean; sortOrder: number; }
const schema = new Schema<IPropertyType>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export const PropertyTypeModel = mongoose.model<IPropertyType>('PropertyType', schema);
