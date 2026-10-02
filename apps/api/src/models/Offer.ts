import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
  property: mongoose.Types.ObjectId;
  lead?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  amount: number;
  currency?: mongoose.Types.ObjectId;
  status: string;
  submittedBy?: mongoose.Types.ObjectId;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  notes?: string;
  conditions?: string;
  counterAmount?: number;
  respondedAt?: Date;
  respondedBy?: mongoose.Types.ObjectId;
  dealStage?: 'offer_accepted' | 'solicitor_instructed' | 'survey_valuation' | 'contracts_exchanged' | 'completed';
  closingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IOffer>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    amount: { type: Number, required: true },
    currency: { type: Schema.Types.ObjectId, ref: 'Currency' },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'countered',
        'SUBMITTED',
        'UNDER_REVIEW',
        'COUNTER_OFFER',
        'ACCEPTED',
        'REJECTED',
        'WITHDRAWN',
      ],
      default: 'SUBMITTED',
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    buyerName: { type: String },
    buyerEmail: { type: String },
    buyerPhone: { type: String },
    notes: { type: String },
    conditions: { type: String },
    counterAmount: { type: Number },
    respondedAt: { type: Date },
    respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    dealStage: {
      type: String,
      enum: ['offer_accepted', 'solicitor_instructed', 'survey_valuation', 'contracts_exchanged', 'completed'],
      default: 'offer_accepted',
    },
    closingDate: { type: Date },
  },
  { timestamps: true }
);

schema.index({ property: 1 });
schema.index({ lead: 1 });
schema.index({ customer: 1 });
schema.index({ status: 1 });
schema.index({ dealStage: 1 });
schema.index({ createdAt: -1 });

export const OfferModel = mongoose.model<IOffer>('Offer', schema);
