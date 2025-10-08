import mongoose from 'mongoose';

const HydroponicBarleySchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  expectedHarvestDate: {
    type: Date,
    required: true
  },
  actualHarvestDate: {
    type: Date,
    default: null
  },
  seedWeight: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['growing', 'ready', 'harvested'],
    default: 'growing'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: String,
    required: true
  },
  farmId: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'hydroponic-barley'
});

// Indexes for better query performance
HydroponicBarleySchema.index({ plateNumber: 1 });
HydroponicBarleySchema.index({ status: 1 });
HydroponicBarleySchema.index({ farmId: 1 });
HydroponicBarleySchema.index({ startDate: 1 });
HydroponicBarleySchema.index({ expectedHarvestDate: 1 });

// Virtual for days growing
HydroponicBarleySchema.virtual('daysGrowing').get(function() {
  const today = new Date();
  const start = new Date(this.startDate);
  const diffTime = today.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until harvest
HydroponicBarleySchema.virtual('daysUntilHarvest').get(function() {
  const today = new Date();
  const expected = new Date(this.expectedHarvestDate);
  const diffTime = expected.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for harvest readiness
HydroponicBarleySchema.virtual('isReadyForHarvest').get(function() {
  const today = new Date();
  const expected = new Date(this.expectedHarvestDate);
  const diffTime = expected.getTime() - today.getTime();
  const daysUntilHarvest = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return daysUntilHarvest <= 2 && this.status !== 'harvested';
});

// Ensure virtual fields are serialized
HydroponicBarleySchema.set('toJSON', { virtuals: true });
HydroponicBarleySchema.set('toObject', { virtuals: true });

export default mongoose.models['HydroponicBarley'] || mongoose.model('HydroponicBarley', HydroponicBarleySchema);