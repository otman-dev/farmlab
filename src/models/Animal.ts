import mongoose from 'mongoose';

const AnimalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  age: { type: Number },
  health: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'animals',
  timestamps: true,
});

export interface Animal {
  _id: mongoose.Types.ObjectId;
  name: string;
  species: string;
  age?: number;
  health?: string;
  notes?: string;
  createdAt: Date;
}

const AnimalModel = mongoose.models.Animal || mongoose.model<Animal>('Animal', AnimalSchema);
export default AnimalModel;
