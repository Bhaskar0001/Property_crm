import mongoose, { Schema, Document } from 'mongoose';
export interface IViewing extends Document { property: mongoose.Types.ObjectId; lead: mongoose.Types.ObjectId; customer: mongoose.Types.ObjectId; scheduledDate: Date; scheduledTime: string; duration: number; status: string; assignedTo: mongoose.Types.ObjectId; notes: string; feedback: string; cancelReason: string; rescheduledFrom: mongoose.Types.ObjectId; confirmedAt: Date; completedAt: Date; }
const schema = new Schema<IViewing>({
  property: { type: Schema.Types.ObjectId, ref: 'Property' },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  scheduledDate: { type: Date },
  scheduledTime: { type: String },
  duration: { type: Number },
  status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'] },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  feedback: { type: String },
  cancelReason: { type: String },
  rescheduledFrom: { type: Schema.Types.ObjectId, ref: 'Viewing' },
  confirmedAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });
schema.index({ property: 1 }); schema.index({ lead: 1 }); schema.index({ assignedTo: 1 }); schema.index({ scheduledDate: 1 }); schema.index({ status: 1 });
export const ViewingModel = mongoose.model<IViewing>('Viewing', schema);
