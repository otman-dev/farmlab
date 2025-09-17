import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  // Add these options to ensure collection creation
  autoCreate: true, // Auto-create the collection if it doesn't exist
  autoIndex: true,  // Auto-create indexes for faster lookups
  collection: 'users' // Explicitly name the collection
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Define a SerializedUser interface for the transformed object
interface SerializedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

// Finalize the toJSON method to exclude `matchPassword`
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret): SerializedUser {
    return {
      id: ret._id.toString(),
      name: ret.name,
      email: ret.email,
      role: ret.role,
      createdAt: ret.createdAt,
    };
  },
});

// Explicitly type the UserModel export
interface User {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const UserModel: mongoose.Model<User> = mongoose.models.User || mongoose.model<User>('User', UserSchema);

// Check if the model already exists to avoid model compilation errors
if (!mongoose.models.User) {
  // Create the model directly since we're already connected to farmLab
  mongoose.model('User', UserSchema);
  
  // Create the collection if it doesn't exist yet
  if (mongoose.connection.readyState === 1) {
    try {
      console.log('Ensuring users collection exists');
      mongoose.connection.createCollection('users').catch(err => {
        // Ignore "collection already exists" error which is expected sometimes
        if (err.code !== 48) {
          console.error('Error creating users collection:', err);
        }
      });
    } catch (error) {
      console.error('Error checking/creating users collection:', error);
    }
  }
}

export default UserModel;