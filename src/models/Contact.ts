import mongoose from "mongoose";

export interface IContact {
  email: string;
  subject: string;
  message: string;
  phone?: string;
  createdAt: Date;
  status: "new" | "read" | "responded" | "resolved";
}

const ContactSchema = new mongoose.Schema<IContact>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["new", "read", "responded", "resolved"],
    default: "new",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for better performance
ContactSchema.index({ email: 1 });
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ status: 1 });

const Contact = mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;