import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import Post from './models/Post.js';
import { publishedFilter } from './utils/postHelpers.js';

const app = express();
const port = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use((req, _res, next) => {
  if (process.env.VERCEL) {
    const url = new URL(req.url, 'http://vercel.local');
    const path = url.searchParams.get('__path');
    if (path !== null) {
      url.searchParams.delete('__path');
      const query = url.searchParams.toString();
      req.url = `/${path}${query ? `?${query}` : ''}`;
    }
  }
  next();
});
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173'] }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), authRoutes);
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.get('/robots.txt', (_req, res) => {
  const base = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${base}/api/sitemap.xml`);
});

app.get('/api/sitemap.xml', async (_req, res) => {
  const base = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
  const posts = await Post.find(publishedFilter()).select('slug updatedAt');
  const urls = [
    `<url><loc>${base}/</loc></url>`,
    `<url><loc>${base}/blog</loc></url>`,
    ...posts.map((post) => `<url><loc>${base}/blog/${post.slug}</loc><lastmod>${post.updatedAt.toISOString()}</lastmod></url>`)
  ].join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'This value already exists' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

if (!process.env.VERCEL) {
  connectDatabase()
    .then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)))
    .catch((error) => {
      console.error('Database connection failed', error);
      process.exit(1);
    });
}

export default app;
