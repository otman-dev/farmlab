import { Schema, Document, Connection, Model } from 'mongoose';

export interface ISupplier extends Document {
  name?: string; // Contact person or main name - now optional
  entrepriseName: string;
  address: string;
  description?: string;
  phones: string[];
  email?: string;
  city?: string;
  category?: string;
  notes?: string;
  createdAt: Date;
}

const SupplierSchema: Schema = new Schema<ISupplier>({
  name: { type: String, required: false, default: '' }, // Make name optional
  entrepriseName: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, required: false, default: '' },
  phones: { type: [String], required: false, default: [] }, // Make phones optional
  email: { type: String, required: false, default: '' },
  city: { type: String, required: false, default: '' },
  category: { type: String, required: false, default: '' },
  notes: { type: String, required: false, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export function getSupplierModel(conn: Connection): Model<ISupplier> {
  return conn.models.Supplier || conn.model<ISupplier>('Supplier', SupplierSchema);
}