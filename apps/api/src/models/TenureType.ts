import mongoose, { Schema, Document } from 'mongoose';
export interface ITenureType extends Document { name: string; slug: string; isActive: boolean; sortOrder: number; }
const schema = new Schema<ITenureType>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export const TenureTypeModel = mongoose.model<ITenureType>('TenureType', schema);
