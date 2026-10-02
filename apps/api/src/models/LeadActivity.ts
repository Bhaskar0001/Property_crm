import mongoose, { Schema, Document } from 'mongoose';
export interface ILeadActivity extends Document { lead: mongoose.Types.ObjectId; type: string; description: string; metadata: any; performedBy: mongoose.Types.ObjectId; }
const schema = new Schema<ILeadActivity>({
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  type: { type: String, enum: ['note', 'call', 'email', 'meeting', 'status_change'] },
  description: { type: String },
  metadata: { type: Schema.Types.Mixed },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ lead: 1, createdAt: 1 });
export const LeadActivityModel = mongoose.model<ILeadActivity>('LeadActivity', schema);
