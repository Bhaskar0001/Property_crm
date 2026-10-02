import mongoose, { Schema, Document } from 'mongoose';
export interface IAuditLog extends Document { user: mongoose.Types.ObjectId; userName: string; action: string; entity: string; entityId: string; ip: string; before: any; after: any; createdAt: Date; }
const schema = new Schema<IAuditLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  action: { type: String },
  entity: { type: String },
  entityId: { type: String },
  ip: { type: String },
  before: { type: Schema.Types.Mixed },
  after: { type: Schema.Types.Mixed }
}, { timestamps: false });
schema.index({ user: 1 }); schema.index({ entity: 1 }); schema.index({ entityId: 1 }); schema.index({ createdAt: 1 });
export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', schema);
