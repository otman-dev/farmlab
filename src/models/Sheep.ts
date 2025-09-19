import mongoose from 'mongoose';

const SheepSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tag: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  health: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'sheep',
  timestamps: true,
});

export interface Sheep {
  _id: mongoose.Types.ObjectId;
  name: string;
  tag: string;
  age: number;
  health: string;
  notes?: string;
  createdAt: Date;
}

const SheepModel = mongoose.models.Sheep || mongoose.model<Sheep>('Sheep', SheepSchema);
export default SheepModel;
