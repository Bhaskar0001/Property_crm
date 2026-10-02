import mongoose, { Schema, Document } from 'mongoose';
export interface ILeadSource extends Document { name: string; slug: string; isActive: boolean; sortOrder: number; }
const schema = new Schema<ILeadSource>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export const LeadSourceModel = mongoose.model<ILeadSource>('LeadSource', schema);
