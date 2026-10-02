import mongoose, { Schema, Document } from 'mongoose';
export interface ITask extends Document { lead: mongoose.Types.ObjectId; title: string; description: string; dueDate: Date; dueTime: string; priority: string; status: string; assignedTo: mongoose.Types.ObjectId; completedAt: Date; completedBy: mongoose.Types.ObjectId; }
const schema = new Schema<ITask>({
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  dueTime: { type: String },
  priority: { type: String, enum: ['low', 'normal', 'high'] },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ lead: 1 }); schema.index({ assignedTo: 1 }); schema.index({ dueDate: 1 }); schema.index({ status: 1 });
export const TaskModel = mongoose.model<ITask>('Task', schema);
