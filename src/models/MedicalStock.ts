import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MedicineUnit {
  openedAt?: Date;
  expiresAt: Date;
}

export interface MedicalStock extends Document {
  product: mongoose.Types.ObjectId; // Reference to Product
  units: MedicineUnit[];
  createdAt: Date;
}

const MedicineUnitSchema: Schema = new Schema<MedicineUnit>({
  openedAt: { type: Date },
  expiresAt: { type: Date, required: true },
});

const MedicalStockSchema: Schema = new Schema<MedicalStock>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  units: { type: [MedicineUnitSchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

const MedicalStockModel: Model<MedicalStock> =
  mongoose.models.MedicalStock || mongoose.model<MedicalStock>('MedicalStock', MedicalStockSchema);

export default MedicalStockModel;
