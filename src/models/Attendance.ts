import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  staff: Types.ObjectId;
  date: Date;
  state: 'present' | 'absent';
  // Optionally, add activity/notes fields here
}

const AttendanceSchema = new Schema<IAttendance>({
  staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: Date, required: true },
  state: { type: String, enum: ['present', 'absent'], required: true },
  // Optionally, add activity/notes fields here
});

AttendanceSchema.index({ staff: 1, date: 1 }, { unique: true }); // Prevent duplicate entries for same staff/date

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
