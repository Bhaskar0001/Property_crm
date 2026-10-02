import mongoose, { Schema, Document } from 'mongoose';
export interface ICustomer extends Document { name: string; email: string; phone: string; country: string; preferences: any; consentGiven: boolean; consentDate: Date; isActive: boolean; lastLoginAt: Date; }
const schema = new Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  country: { type: String },
  preferences: { type: Schema.Types.Mixed },
  consentGiven: { type: Boolean, default: false },
  consentDate: { type: Date },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date }
}, { timestamps: true });
schema.index({ email: 1 });
export const CustomerModel = mongoose.model<ICustomer>('Customer', schema);
