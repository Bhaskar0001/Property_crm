import mongoose, { Schema, Document } from 'mongoose';
export interface IPropertyDocument extends Document { property: mongoose.Types.ObjectId; name: string; type: string; fileUrl: string; fileName: string; fileSize: number; mimeType: string; visibility: string; version: string; expiryDate: Date; uploadedBy: mongoose.Types.ObjectId; }
const schema = new Schema<IPropertyDocument>({
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['brochure', 'floor_plan', 'legal', 'other'] },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  fileSize: { type: Number },
  mimeType: { type: String },
  visibility: { type: String, enum: ['public', 'private', 'staff'] },
  version: { type: String },
  expiryDate: { type: Date },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ property: 1, visibility: 1 });
export const PropertyDocumentModel = mongoose.model<IPropertyDocument>('PropertyDocument', schema);
