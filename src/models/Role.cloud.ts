import { Schema, Document, Connection } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  permissions: [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now },
});

export function getRoleModel(conn: Connection) {
  return conn.models.Role || conn.model<IRole>('Role', RoleSchema);
}