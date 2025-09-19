import mongoose from 'mongoose';

const RFIDCardSchema = new mongoose.Schema({
  cardId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['known', 'unknown'], default: 'unknown' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  detectedAt: { type: Date, default: Date.now },
  notes: { type: String },
}, {
  collection: 'rfidcards',
  timestamps: true,
});

export interface RFIDCard {
  _id: mongoose.Types.ObjectId;
  cardId: string;
  status: 'known' | 'unknown';
  user?: mongoose.Types.ObjectId;
  detectedAt: Date;
  notes?: string;
}

const RFIDCardModel = mongoose.models.RFIDCard || mongoose.model<RFIDCard>('RFIDCard', RFIDCardSchema);
export default RFIDCardModel;
