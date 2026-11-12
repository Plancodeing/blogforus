import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './config/db.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Author from './models/Author.js';
import Post from './models/Post.js';

const categories = [
  ['Software Development', 'software-development', '#5b5bd6'],
  ['Artificial Intelligence & Machine Learning', 'artificial-intelligence-machine-learning', '#7c3aed'],
  ['Web and Mobile App Development', 'web-mobile-app-development', '#0f766e'],
  ['Technology & Innovation', 'technology-innovation', '#c2410c'],
  ['Cybersecurity', 'cybersecurity', '#be123c'],
  ['Cloud Computing', 'cloud-computing', '#0369a1'],
  ['Industry Insights', 'industry-insights', '#4d7c0f']
];

async function seed() {
  await connectDatabase();
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 12);
  const admin = await User.findOneAndUpdate(
    { role: 'admin' },
    { name: 'Blog Administrator', email, password, role: 'admin', active: true },
    { upsert: true, new: true }
  );

  const savedCategories = [];
  for (const [name, slug, color] of categories) {
    savedCategories.push(await Category.findOneAndUpdate({ slug }, { name, slug, color }, { upsert: true, new: true }));
  }

  const author = await Author.findOneAndUpdate(
    { email: 'editor@example.com' },
    { name: 'Pooja Tech Editorial Team', email: 'editor@example.com', bio: 'Practical technology insights from engineers and product builders.' },
    { upsert: true, new: true }
  );

  if (!(await Post.exists({ slug: 'building-resilient-modern-web-applications' }))) {
    await Post.create({
      title: 'Building Resilient Modern Web Applications',
      slug: 'building-resilient-modern-web-applications',
      excerpt: 'A practical guide to the architectural choices that make web products reliable, maintainable and ready to scale.',
      content: '<h2>Reliability starts with clear boundaries</h2><p>Modern applications become easier to evolve when responsibilities are explicit across the user interface, API and data layer.</p><h2>Design for observable failure</h2><p>Structured logs, health checks and actionable alerts turn unexpected behaviour into information your team can use.</p><pre><code>app.get("/health", (req, res) =&gt; res.json({ status: "ok" }));</code></pre><h2>Keep the experience fast</h2><p>Measure real user performance, optimise images and ship only the JavaScript needed for each page.</p>',
      featuredImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Developer working with code on a laptop',
      category: savedCategories[0]._id,
      tags: ['architecture', 'web development', 'performance'],
      author: author._id,
      status: 'published',
      publishAt: new Date(),
      featured: true,
      readingTime: 4,
      seoTitle: 'Building Resilient Modern Web Applications',
      metaDescription: 'Learn practical architecture, observability and performance techniques for resilient modern web applications.',
      createdBy: admin._id
    });
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
