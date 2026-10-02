import mongoose, { Schema, Document } from 'mongoose';
export interface IOtpRecord extends Document { email: string; otpHash: string; expiresAt: Date; attempts: number; maxAttempts: number; isUsed: boolean; usedAt: Date; }
const schema = new Schema<IOtpRecord>({
  email: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date }
}, { timestamps: true });
schema.index({ email: 1 }); schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const OtpRecordModel = mongoose.model<IOtpRecord>('OtpRecord', schema);
