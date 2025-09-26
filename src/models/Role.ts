import mongoose from 'mongoose';

// Define Role schema
const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a role name'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  permissions: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  autoCreate: true,
  autoIndex: true,
  collection: 'roles'
});

// Define a SerializedRole interface
interface SerializedRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
}

RoleSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret): SerializedRole {
    return {
      id: ret._id.toString(),
      name: ret.name,
      description: ret.description,
      permissions: ret.permissions,
      createdAt: ret.createdAt,
    };
  },
});

export interface Role {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
}

const RoleModel: mongoose.Model<Role> = mongoose.models.Role || mongoose.model<Role>('Role', RoleSchema);

// Ensure collection exists
if (!mongoose.models.Role) {
  mongoose.model('Role', RoleSchema);

  if (mongoose.connection.readyState === 1) {
    try {
      console.log('Ensuring roles collection exists');
      mongoose.connection.createCollection('roles').catch(err => {
        if (err.code !== 48) {
          console.error('Error creating roles collection:', err);
        }
      });
    } catch (error) {
      console.error('Error checking/creating roles collection:', error);
    }
  }
}

export default RoleModel;