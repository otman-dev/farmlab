import { Schema, Document, Connection, Model } from 'mongoose';

export interface IMedicalStock extends Document {
  productId: string;
  quantity: number;
  createdAt: Date;
}

const MedicalStockSchema: Schema = new Schema<IMedicalStock>({
  productId: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export function getMedicalStockModel(conn: Connection): Model<IMedicalStock> {
  return conn.models.MedicalStock || conn.model<IMedicalStock>('MedicalStock', MedicalStockSchema);
}