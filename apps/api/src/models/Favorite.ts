import mongoose, { Schema, Document } from 'mongoose';
export interface IFavorite extends Document { customer: mongoose.Types.ObjectId; property: mongoose.Types.ObjectId; }
const schema = new Schema<IFavorite>({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true }
}, { timestamps: true });
schema.index({ customer: 1, property: 1 }, { unique: true });
export const FavoriteModel = mongoose.model<IFavorite>('Favorite', schema);
