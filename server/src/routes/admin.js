import { Router } from 'express';
import multer from 'multer';
import { put } from '@vercel/blob';
import slugify from 'slugify';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import Author from '../models/Author.js';
import User from '../models/User.js';
import { protect, allowRoles } from '../middleware/auth.js';
import { calculateReadingTime, uniquePostSlug } from '../utils/postHelpers.js';

const router = Router();
router.use(protect);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype))
});

router.get('/dashboard', async (_req, res) => {
  const now = new Date();
  const [total, published, drafts, scheduled, views] = await Promise.all([
    Post.countDocuments(),
    Post.countDocuments({ status: 'published', publishAt: { $lte: now } }),
    Post.countDocuments({ status: 'draft' }),
    Post.countDocuments({ $or: [{ status: 'scheduled' }, { status: 'published', publishAt: { $gt: now } }] }),
    Post.aggregate([{ $group: { _id: null, value: { $sum: '$views' } } }])
  ]);
  const recent = await Post.find().populate('category author').sort({ updatedAt: -1 }).limit(6);
  res.json({ stats: { total, published, drafts, scheduled, views: views[0]?.value || 0 }, recent });
});

router.get('/posts', async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.$text = { $search: req.query.search };
  const posts = await Post.find(filter).populate('category author').sort({ updatedAt: -1 });
  res.json({ posts });
});

router.get('/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('category author');
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ post });
});

router.post('/posts', async (req, res) => {
  const data = req.body;
  const post = await Post.create({
    ...data,
    slug: await uniquePostSlug(data.slug || data.title),
    readingTime: calculateReadingTime(data.content),
    publishAt: data.publishAt || (data.status === 'published' ? new Date() : null),
    createdBy: req.user._id
  });
  res.status(201).json({ post: await post.populate('category author') });
});

router.put('/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  Object.assign(post, req.body);
  post.slug = await uniquePostSlug(req.body.slug || req.body.title || post.title, post._id);
  post.readingTime = calculateReadingTime(post.content);
  if (post.status === 'published' && !post.publishAt) post.publishAt = new Date();
  await post.save();
  res.json({ post: await post.populate('category author') });
});

router.delete('/posts/:id', allowRoles('admin'), async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ message: 'Post deleted' });
});

router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'A valid image is required' });
  const safeName = slugify(req.file.originalname, { lower: true, strict: true }) || `image-${Date.now()}`;
  const blob = await put(`blog/${Date.now()}-${safeName}`, req.file.buffer, {
    access: 'public',
    contentType: req.file.mimetype,
    addRandomSuffix: true
  });
  res.status(201).json({ url: blob.url });
});

router.get('/categories', async (_req, res) => res.json({ categories: await Category.find().sort({ name: 1 }) }));
router.post('/categories', async (req, res) => {
  const category = await Category.create({ ...req.body, slug: slugify(req.body.slug || req.body.name, { lower: true, strict: true }) });
  res.status(201).json({ category });
});
router.put('/categories/:id', async (req, res) => {
  const data = { ...req.body };
  if (data.name || data.slug) data.slug = slugify(data.slug || data.name, { lower: true, strict: true });
  res.json({ category: await Category.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }) });
});
router.delete('/categories/:id', allowRoles('admin'), async (req, res) => {
  if (await Post.exists({ category: req.params.id })) return res.status(409).json({ message: 'Category is in use' });
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
});

router.get('/authors', async (_req, res) => res.json({ authors: await Author.find().sort({ name: 1 }) }));
router.post('/authors', async (req, res) => res.status(201).json({ author: await Author.create(req.body) }));
router.put('/authors/:id', async (req, res) => res.json({ author: await Author.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) }));
router.delete('/authors/:id', allowRoles('admin'), async (req, res) => {
  if (await Post.exists({ author: req.params.id })) return res.status(409).json({ message: 'Author is in use' });
  await Author.findByIdAndDelete(req.params.id);
  res.json({ message: 'Author deleted' });
});

router.get('/users', allowRoles('admin'), async (_req, res) => res.json({ users: await User.find().select('-password').sort({ name: 1 }) }));

export default router;


