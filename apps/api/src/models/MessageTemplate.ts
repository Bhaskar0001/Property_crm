import mongoose, { Schema, Document } from 'mongoose';
export interface IMessageTemplate extends Document { name: string; language: string; category: string; body: string; headerType: string; headerContent: string; footerText: string; buttons: any[]; whatsappTemplateId: string; isApproved: boolean; isActive: boolean; }
const schema = new Schema<IMessageTemplate>({
  name: { type: String, required: true, unique: true },
  language: { type: String },
  category: { type: String },
  body: { type: String },
  headerType: { type: String },
  headerContent: { type: String },
  footerText: { type: String },
  buttons: [{ type: Schema.Types.Mixed }],
  whatsappTemplateId: { type: String },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export const MessageTemplateModel = mongoose.model<IMessageTemplate>('MessageTemplate', schema);
