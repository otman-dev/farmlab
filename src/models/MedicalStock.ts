
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MedicalStock extends Document {
  productId: string;
  // productName removed; use productId reference only
  quantity: number;
  createdAt: Date;
}

const MedicalStockSchema: Schema = new Schema<MedicalStock>({
  productId: { type: String, required: true, unique: true },
  // productName removed from schema
  quantity: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const MedicalStockModel: Model<MedicalStock> =
  mongoose.models.MedicalStock || mongoose.model<MedicalStock>('MedicalStock', MedicalStockSchema);

export default MedicalStockModel;
