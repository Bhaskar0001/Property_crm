import mongoose, { Schema, Document } from 'mongoose';
export interface ISetting extends Document { key: string; value: any; group: string; description: string; }
const schema = new Schema<ISetting>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed },
  group: { type: String },
  description: { type: String }
}, { timestamps: true });
export const SettingModel = mongoose.model<ISetting>('Setting', schema);
