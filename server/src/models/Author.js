import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    social: {
      linkedin: { type: String, default: '' },
      x: { type: String, default: '' },
      website: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

export default mongoose.model('Author', authorSchema);

