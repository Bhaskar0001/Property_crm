import mongoose, { Schema, Document } from 'mongoose';

export interface IViewing extends Document {
  property: mongoose.Types.ObjectId;
  lead?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  visitType?: 'in_person' | 'virtual';
  virtualPlatform?: 'whatsapp_video' | 'zoom' | 'google_meet' | 'facetime' | 'other';
  meetingLink?: string;
  scheduledDate: Date;
  scheduledTime: string;
  duration?: number;
  status: string;
  assignedTo?: mongoose.Types.ObjectId;
  notes?: string;
  feedback?: string;
  cancelReason?: string;
  rescheduledFrom?: mongoose.Types.ObjectId;
  confirmedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IViewing>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    visitType: {
      type: String,
      enum: ['in_person', 'virtual'],
      default: 'in_person',
    },
    virtualPlatform: {
      type: String,
      enum: ['whatsapp_video', 'zoom', 'google_meet', 'facetime', 'other'],
      default: 'whatsapp_video',
    },
    meetingLink: { type: String },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, default: '10:00' },
    duration: { type: Number, default: 30 },
    status: {
      type: String,
      enum: [
        'scheduled',
        'confirmed',
        'completed',
        'cancelled',
        'rescheduled',
        'no_show',
        'REQUESTED',
        'CONFIRMED',
        'COMPLETED',
        'CANCELLED',
        'RESCHEDULED',
        'NO_SHOW',
      ],
      default: 'CONFIRMED',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    feedback: { type: String },
    cancelReason: { type: String },
    rescheduledFrom: { type: Schema.Types.ObjectId, ref: 'Viewing' },
    confirmedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

schema.index({ property: 1 });
schema.index({ lead: 1 });
schema.index({ customer: 1 });
schema.index({ assignedTo: 1 });
schema.index({ scheduledDate: 1 });
schema.index({ status: 1 });

export const ViewingModel = mongoose.model<IViewing>('Viewing', schema);
