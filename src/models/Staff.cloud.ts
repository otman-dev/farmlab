import { Schema, Document, Connection, Model } from 'mongoose';

export type StaffRole = 'helping_hand' | 'cleaner';

export interface IStaff extends Document {
  name: string;
  role: StaffRole;
  contact?: string;
  createdAt: Date;
}

const StaffSchema = new Schema<IStaff>({
  name: { type: String, required: true },
  role: { type: String, enum: ['helping_hand', 'cleaner'], required: true },
  contact: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export function getStaffModel(conn: Connection): Model<IStaff> {
  return conn.models.Staff || conn.model<IStaff>('Staff', StaffSchema);
}
