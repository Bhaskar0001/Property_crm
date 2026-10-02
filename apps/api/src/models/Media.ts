import mongoose, { Schema, Document } from 'mongoose';
export interface IMedia extends Document { property: mongoose.Types.ObjectId; type: string; originalUrl: string; thumbnailUrl: string; webUrl: string; fileName: string; fileSize: number; mimeType: string; width: number; height: number; sortOrder: number; isCover: boolean; altText: string; uploadedBy: mongoose.Types.ObjectId; }
const schema = new Schema<IMedia>({
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  type: { type: String, enum: ['image', 'video', 'document'] },
  originalUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  webUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  mimeType: { type: String },
  width: { type: Number },
  height: { type: Number },
  sortOrder: { type: Number, default: 0 },
  isCover: { type: Boolean, default: false },
  altText: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ property: 1, type: 1, sortOrder: 1 });
export const MediaModel = mongoose.model<IMedia>('Media', schema);
