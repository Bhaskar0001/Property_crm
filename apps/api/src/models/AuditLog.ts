import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  user?: mongoose.Types.ObjectId;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  ip?: string;
  userAgent?: string;
  before?: any;
  after?: any;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: 'System' },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

schema.index({ user: 1 });
schema.index({ entity: 1 });
schema.index({ entityId: 1 });
schema.index({ createdAt: -1 });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', schema);
