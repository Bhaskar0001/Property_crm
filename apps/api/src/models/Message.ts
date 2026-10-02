import mongoose, { Schema, Document } from 'mongoose';
export interface IMessage extends Document { conversation: mongoose.Types.ObjectId; direction: string; type: string; content: string; mediaUrl: string; templateName: string; templateParams: any; whatsappMessageId: string; status: string; sentBy: mongoose.Types.ObjectId; deliveredAt: Date; readAt: Date; failedReason: string; }
const schema = new Schema<IMessage>({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  direction: { type: String, enum: ['inbound', 'outbound'] },
  type: { type: String, enum: ['text', 'image', 'document', 'template'] },
  content: { type: String },
  mediaUrl: { type: String },
  templateName: { type: String },
  templateParams: { type: Schema.Types.Mixed },
  whatsappMessageId: { type: String, sparse: true, unique: true },
  status: { type: String, enum: ['pending', 'sent', 'delivered', 'read', 'failed'] },
  sentBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deliveredAt: { type: Date },
  readAt: { type: Date },
  failedReason: { type: String }
}, { timestamps: true });
schema.index({ conversation: 1, createdAt: 1 });
export const MessageModel = mongoose.model<IMessage>('Message', schema);
