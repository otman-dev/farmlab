import mongoose, { Schema, Document, Model } from 'mongoose';


export interface Supplier extends Document {
  name: string; // Contact person or main name
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

const SupplierSchema: Schema = new Schema<Supplier>({
  name: { type: String, required: true },
  entrepriseName: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String },
  phones: { type: [String], required: true, default: [] },
  email: { type: String },
  city: { type: String },
  category: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const SupplierModel: Model<Supplier> =
  mongoose.models.Supplier || mongoose.model<Supplier>('Supplier', SupplierSchema);

export default SupplierModel;
