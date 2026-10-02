import mongoose, { Schema, Document } from 'mongoose';
export interface ILeadStage extends Document { name: string; code: string; color: string; isActive: boolean; sortOrder: number; isFinal: boolean; }
const schema = new Schema<ILeadStage>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  color: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  isFinal: { type: Boolean, default: false }
}, { timestamps: true });
export const LeadStageModel = mongoose.model<ILeadStage>('LeadStage', schema);
