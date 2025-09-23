import mongoose, { Schema, Document } from 'mongoose';

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

export default mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema);
