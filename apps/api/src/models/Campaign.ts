import mongoose, { Schema, Document } from 'mongoose';
export interface ICampaign extends Document { name: string; template: mongoose.Types.ObjectId; status: string; audience: any; totalRecipients: number; sentCount: number; deliveredCount: number; readCount: number; failedCount: number; scheduledAt: Date; startedAt: Date; completedAt: Date; createdBy: mongoose.Types.ObjectId; }
const schema = new Schema<ICampaign>({
  name: { type: String, required: true },
  template: { type: Schema.Types.ObjectId, ref: 'MessageTemplate' },
  status: { type: String, enum: ['draft', 'scheduled', 'running', 'completed', 'failed'] },
  audience: { type: Schema.Types.Mixed },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  scheduledAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ status: 1 }); schema.index({ createdBy: 1 });
export const CampaignModel = mongoose.model<ICampaign>('Campaign', schema);
