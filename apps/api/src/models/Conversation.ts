import mongoose, { Schema, Document } from 'mongoose';
export interface IConversation extends Document { lead: mongoose.Types.ObjectId; customer: mongoose.Types.ObjectId; phoneNumber: string; lastMessageAt: Date; lastMessagePreview: string; unreadCount: number; assignedTo: mongoose.Types.ObjectId; isOptedOut: boolean; }
const schema = new Schema<IConversation>({
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  phoneNumber: { type: String },
  lastMessageAt: { type: Date },
  lastMessagePreview: { type: String },
  unreadCount: { type: Number, default: 0 },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  isOptedOut: { type: Boolean, default: false }
}, { timestamps: true });
schema.index({ customer: 1 }); schema.index({ lead: 1 }); schema.index({ assignedTo: 1 });
export const ConversationModel = mongoose.model<IConversation>('Conversation', schema);
