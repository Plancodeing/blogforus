# Pooja Technology Blog

A responsive full-stack technology publishing platform built with MongoDB, Express, React and Node.js.

## Included

- Editorial homepage with featured, latest and trending articles
- Search, categories, tags and paginated article listing
- Rich article pages with table of contents, sharing, related posts and previous/next navigation
- Secure JWT admin login with admin/editor roles
- Create, edit, draft, schedule, publish, feature and delete articles
- Featured-image upload plus categories and author management
- SEO titles/descriptions, Open Graph metadata, Article schema, sitemap and robots.txt
- Responsive layouts for desktop, tablet and mobile

## Quick start

1. Install Node.js 20+ and MongoDB 7+, or run MongoDB with Docker:

   ```bash
   docker compose up -d
   ```

2. Copy `.env.example` to `.env` and change `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create initial categories, admin account, author and sample article:

   ```bash
   npm run seed
   ```

5. Start both applications:

   ```bash
   npm run dev
   ```

Public website: `http://localhost:5173`

Admin login: `http://localhost:5173/login`

API health check: `http://localhost:5000/api/health`

## Production notes

- Set `CLIENT_URL` to the deployed frontend URL.
- Set `VITE_API_URL` while building the frontend.
- Store uploads in S3, Cloudinary or another persistent object store when deploying to stateless hosting.
- Use a managed MongoDB deployment with backups and restricted network access.
- Replace the local HTML content editor with TipTap or CKEditor if a visual block editor is required.

## Vercel deployment

Create two Vercel projects from this repository:

- Frontend root directory: `client`
- Backend root directory: `server`

Backend environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `BLOB_READ_WRITE_TOKEN`

Frontend environment variable:

- `VITE_API_URL=https://your-backend.vercel.app/api`

After both deployments are live, set `CLIENT_URL` on the backend to the final frontend URL and redeploy it.

