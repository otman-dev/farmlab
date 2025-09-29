import mongoose from 'mongoose';

const RegistrationResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  responses: {
    type: Object,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  autoCreate: true,
  autoIndex: true,
  collection: 'registration_responses',
});

const RegistrationResponseModel = mongoose.models.RegistrationResponse || mongoose.model('RegistrationResponse', RegistrationResponseSchema);
export default RegistrationResponseModel;
