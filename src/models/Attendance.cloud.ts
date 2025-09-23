import { Schema, Document, Types, Connection } from 'mongoose';


export interface IAttendance extends Document {
  staff: Types.ObjectId;
  date: string; // YYYY-MM-DD
  state: 'present' | 'absent';
}


const AttendanceSchema = new Schema<IAttendance>({
  staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: String, required: true }, // Store as YYYY-MM-DD string
  state: { type: String, enum: ['present', 'absent'], required: true },
});

AttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

export function getAttendanceModel(conn: Connection) {
  return conn.models.Attendance || conn.model<IAttendance>('Attendance', AttendanceSchema);
}
