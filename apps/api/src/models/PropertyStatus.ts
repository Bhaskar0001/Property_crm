import mongoose, { Schema, Document } from 'mongoose';
export interface IPropertyStatus extends Document { name: string; code: string; color: string; isActive: boolean; sortOrder: number; }
const schema = new Schema<IPropertyStatus>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  color: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export const PropertyStatusModel = mongoose.model<IPropertyStatus>('PropertyStatus', schema);
