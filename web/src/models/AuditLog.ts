// Mongoose Audit Log Model (FST Unit 4: Document stores with Mongoose)
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  entityType: 'ITEM' | 'CLAIM' | 'USER' | 'AUTH';
  entityId?: string;
  performedBy: string;
  role: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    entityType: { type: String, enum: ['ITEM', 'CLAIM', 'USER', 'AUTH'], required: true },
    entityId: { type: String },
    performedBy: { type: String, required: true },
    role: { type: String, default: 'USER' },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
