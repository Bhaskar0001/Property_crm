import mongoose, { Schema, Document } from 'mongoose';
export interface IOffer extends Document { property: mongoose.Types.ObjectId; lead: mongoose.Types.ObjectId; amount: number; currency: mongoose.Types.ObjectId; status: string; submittedBy: mongoose.Types.ObjectId; notes: string; counterAmount: number; respondedAt: Date; respondedBy: mongoose.Types.ObjectId; }
const schema = new Schema<IOffer>({
  property: { type: Schema.Types.ObjectId, ref: 'Property' },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  amount: { type: Number },
  currency: { type: Schema.Types.ObjectId, ref: 'Currency' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'countered'] },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  counterAmount: { type: Number },
  respondedAt: { type: Date },
  respondedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ property: 1 }); schema.index({ lead: 1 }); schema.index({ status: 1 });
export const OfferModel = mongoose.model<IOffer>('Offer', schema);
