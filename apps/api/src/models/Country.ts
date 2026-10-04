import mongoose, { Schema, Document } from 'mongoose';
export interface ICountry extends Document {
  name: string;
  isoCode: string;
  currency: mongoose.Types.ObjectId;
  timezone: string;
  phoneCode: string;
  flag?: string;
  flagUrl?: string;
  imageUrl?: string;
  isActive: boolean;
}
const schema = new Schema<ICountry>({
  name: { type: String, required: true },
  isoCode: { type: String, required: true, unique: true },
  currency: { type: Schema.Types.ObjectId, ref: 'Currency' },
  timezone: { type: String },
  phoneCode: { type: String },
  flag: { type: String },
  flagUrl: { type: String },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export const CountryModel = mongoose.model<ICountry>('Country', schema);
