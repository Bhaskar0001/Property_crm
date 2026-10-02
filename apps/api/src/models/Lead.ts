import mongoose, { Schema, Document } from 'mongoose';
export interface ILead extends Document { customer: mongoose.Types.ObjectId; property: mongoose.Types.ObjectId; source: mongoose.Types.ObjectId; stage: mongoose.Types.ObjectId; assignedTo: mongoose.Types.ObjectId; priority: string; requirements: any; interestedProperties: mongoose.Types.ObjectId[]; matchedProperties: mongoose.Types.ObjectId[]; notes: string; lastContactedAt: Date; convertedAt: Date; lostReason: string; }
const schema = new Schema<ILead>({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  property: { type: Schema.Types.ObjectId, ref: 'Property' },
  source: { type: Schema.Types.ObjectId, ref: 'LeadSource' },
  stage: { type: Schema.Types.ObjectId, ref: 'LeadStage' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  requirements: { type: Schema.Types.Mixed },
  interestedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  matchedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  notes: { type: String },
  lastContactedAt: { type: Date },
  convertedAt: { type: Date },
  lostReason: { type: String }
}, { timestamps: true });
schema.index({ customer: 1 }); schema.index({ property: 1 }); schema.index({ assignedTo: 1 }); schema.index({ stage: 1 }); schema.index({ source: 1 }); schema.index({ priority: 1 });
export const LeadModel = mongoose.model<ILead>('Lead', schema);
