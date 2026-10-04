import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      default: 'alert',
      enum: ['alert', 'reminder', 'message', 'lead', 'viewing', 'offer', 'system', 'SYSTEM'],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

schema.index({ recipient: 1, isRead: 1 });
schema.index({ createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>('Notification', schema);
