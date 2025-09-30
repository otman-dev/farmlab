import mongoose from "mongoose";

export interface IContactCloud {
  email: string;
  subject: string;
  message: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  status: "new" | "read" | "responded" | "resolved";
  priority: "low" | "medium" | "high";
  tags: string[];
}

const ContactCloudSchema = new mongoose.Schema<IContactCloud>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: "Please enter a valid email address"
    },
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: "Please enter a valid phone number"
    },
  },
  status: {
    type: String,
    enum: ["new", "read", "responded", "resolved"],
    default: "new",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  tags: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
ContactCloudSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add compound indexes for efficient queries
ContactCloudSchema.index({ email: 1, createdAt: -1 });
ContactCloudSchema.index({ status: 1, priority: -1, createdAt: -1 });
ContactCloudSchema.index({ tags: 1 });
ContactCloudSchema.index({ createdAt: -1 });

const ContactCloud = mongoose.models.ContactCloud || mongoose.model<IContactCloud>("ContactCloud", ContactCloudSchema);

export default ContactCloud;