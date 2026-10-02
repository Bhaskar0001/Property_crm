import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadActivity extends Document {
  lead: mongoose.Types.ObjectId;
  type: string;
  description: string;
  metadata?: any;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ILeadActivity>(
  {
    lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

schema.index({ lead: 1, createdAt: -1 });

export const LeadActivityModel = mongoose.model<ILeadActivity>('LeadActivity', schema);
