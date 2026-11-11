import slugify from 'slugify';
import Post from '../models/Post.js';

export function calculateReadingTime(html = '') {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export async function uniquePostSlug(value, ignoreId) {
  const base = slugify(value, { lower: true, strict: true }) || `post-${Date.now()}`;
  let slug = base;
  let suffix = 2;
  while (await Post.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

export function publishedFilter(extra = {}) {
  return { status: 'published', publishAt: { $lte: new Date() }, ...extra };
}

