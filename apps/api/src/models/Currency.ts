import mongoose, { Schema, Document } from 'mongoose';
export interface ICurrency extends Document { code: string; symbol: string; name: string; isActive: boolean; isDefault: boolean; }
const schema = new Schema<ICurrency>({
  code: { type: String, required: true, unique: true },
  symbol: { type: String },
  name: { type: String },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });
export const CurrencyModel = mongoose.model<ICurrency>('Currency', schema);
