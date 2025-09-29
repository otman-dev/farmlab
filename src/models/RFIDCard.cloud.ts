import { Schema, Document, Connection, Types, Model } from 'mongoose';

export interface IRFIDCard extends Document {
  cardId: string;
  status: 'known' | 'unknown';
  user?: Types.ObjectId;
  detectedAt: Date;
  notes?: string;
}

const RFIDCardSchema = new Schema<IRFIDCard>({
  cardId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['known', 'unknown'], default: 'unknown' },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  detectedAt: { type: Date, default: Date.now },
  notes: { type: String },
}, {
  collection: 'rfidcards',
  timestamps: true,
});

export function getRFIDCardModel(conn: Connection): Model<IRFIDCard> {
  return conn.models.RFIDCard || conn.model<IRFIDCard>('RFIDCard', RFIDCardSchema);
}