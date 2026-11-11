import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock } from 'lucide-react';

export function formatDate(value) {
  return value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '';
}

export default function ArticleCard({ post, compact = false }) {
  return (
    <article className={compact ? 'article-card compact' : 'article-card'}>
      <Link to={`/blog/${post.slug}`} className="article-image-wrap">
        <img className="article-image" src={post.featuredImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'} alt={post.imageAlt || ''} loading="lazy" />
      </Link>
      <div className="article-body">
        <div className="article-meta"><span style={{ color: post.category?.color }}>{post.category?.name}</span><span>{formatDate(post.publishAt)}</span></div>
        <h3><Link to={`/blog/${post.slug}`}>{post.title}</Link></h3>
        {!compact && <p>{post.excerpt}</p>}
        <div className="article-foot"><span><Clock size={15} /> {post.readingTime} min read</span><Link to={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}><ArrowUpRight size={19} /></Link></div>
      </div>
    </article>
  );
}

