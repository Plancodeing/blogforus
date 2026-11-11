import { Router } from 'express';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import { publishedFilter } from '../utils/postHelpers.js';

const router = Router();
const populate = [
  { path: 'category', select: 'name slug color' },
  { path: 'author', select: 'name avatar bio social' }
];

router.get('/home', async (_req, res) => {
  const filter = publishedFilter();
  const [featured, latest, trending, categories] = await Promise.all([
    Post.find({ ...filter, featured: true }).populate(populate).sort({ publishAt: -1 }).limit(4),
    Post.find(filter).populate(populate).sort({ publishAt: -1 }).limit(9),
    Post.find(filter).populate(populate).sort({ views: -1, publishAt: -1 }).limit(5),
    Category.find().sort({ name: 1 })
  ]);
  res.json({ featured, latest, trending, categories });
});

router.get('/posts', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 9));
  const filter = publishedFilter();
  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category });
    if (!category) return res.json({ posts: [], page, pages: 0, total: 0 });
    filter.category = category._id;
  }
  if (req.query.search?.trim()) filter.$text = { $search: req.query.search.trim() };
  if (req.query.tag?.trim()) filter.tags = req.query.tag.trim().toLowerCase();

  const [posts, total] = await Promise.all([
    Post.find(filter).populate(populate).sort({ publishAt: -1 }).skip((page - 1) * limit).limit(limit),
    Post.countDocuments(filter)
  ]);
  res.json({ posts, page, pages: Math.ceil(total / limit), total });
});

router.get('/posts/:slug', async (req, res) => {
  const post = await Post.findOne(publishedFilter({ slug: req.params.slug })).populate(populate);
  if (!post) return res.status(404).json({ message: 'Article not found' });
  post.views += 1;
  await post.save();

  const [related, previous, next] = await Promise.all([
    Post.find(publishedFilter({ category: post.category._id, _id: { $ne: post._id } }))
      .populate(populate).sort({ publishAt: -1 }).limit(3),
    Post.findOne(publishedFilter({ publishAt: { $lt: post.publishAt } })).select('title slug').sort({ publishAt: -1 }),
    Post.findOne(publishedFilter({ publishAt: { $gt: post.publishAt } })).select('title slug').sort({ publishAt: 1 })
  ]);
  res.json({ post, related, previous, next });
});

router.get('/categories', async (_req, res) => {
  const categories = await Category.aggregate([
    { $lookup: { from: 'posts', localField: '_id', foreignField: 'category', as: 'posts' } },
    { $addFields: { count: { $size: { $filter: { input: '$posts', as: 'post', cond: { $eq: ['$$post.status', 'published'] } } } } } },
    { $project: { posts: 0 } },
    { $sort: { name: 1 } }
  ]);
  res.json({ categories });
});

export default router;

