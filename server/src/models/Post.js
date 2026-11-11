import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, maxlength: 320 },
    content: { type: String, required: true },
    featuredImage: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    status: { type: String, enum: ['draft', 'scheduled', 'published'], default: 'draft' },
    publishAt: { type: Date, default: null },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    readingTime: { type: Number, default: 1 },
    seoTitle: { type: String, maxlength: 70, default: '' },
    metaDescription: { type: String, maxlength: 170, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
postSchema.index({ status: 1, publishAt: -1 });
postSchema.index({ category: 1, publishAt: -1 });

export default mongoose.model('Post', postSchema);

