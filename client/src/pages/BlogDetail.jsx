import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { ArrowLeft, ArrowRight, Clock, Link2, Linkedin, Twitter } from 'lucide-react';
import api from '../api.js';
import ArticleCard, { formatDate } from '../components/ArticleCard.jsx';
import Loading from '../components/Loading.jsx';

function extractHeadings(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return [...doc.querySelectorAll('h2, h3')].map((heading, index) => ({ id: `section-${index + 1}`, label: heading.textContent, level: heading.tagName }));
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { window.scrollTo(0, 0); setData(null); api.get(`/posts/${slug}`).then(({ data }) => setData(data)).catch(() => setError('Article not found.')); }, [slug]);
  const prepared = useMemo(() => {
    if (!data?.post?.content) return { html: '', headings: [] };
    const doc = new DOMParser().parseFromString(DOMPurify.sanitize(data.post.content), 'text/html');
    const headings = [...doc.querySelectorAll('h2, h3')].map((heading, index) => { const item = { id: `section-${index + 1}`, label: heading.textContent, level: heading.tagName }; heading.id = item.id; return item; });
    return { html: doc.body.innerHTML, headings };
  }, [data]);
  if (error) return <div className="empty-state"><h2>{error}</h2><Link to="/blog">Return to all stories</Link></div>;
  if (!data) return <Loading label="Opening the story" />;
  const { post, related, previous, next } = data;
  const url = window.location.href;
  const schema = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, image: post.featuredImage, datePublished: post.publishAt, dateModified: post.updatedAt, author: { '@type': 'Person', name: post.author?.name }, description: post.metaDescription || post.excerpt };

  return (
    <>
      <Helmet><title>{post.seoTitle || post.title} | Pooja Tech Journal</title><meta name="description" content={post.metaDescription || post.excerpt} /><meta property="og:type" content="article" /><meta property="og:title" content={post.seoTitle || post.title} /><meta property="og:description" content={post.metaDescription || post.excerpt} /><meta property="og:image" content={post.featuredImage} /><script type="application/ld+json">{JSON.stringify(schema)}</script></Helmet>
      <article className="detail-page">
        <header className="article-header container narrow"><Link className="back-link" to="/blog"><ArrowLeft size={17} /> All stories</Link><span className="eyebrow" style={{ color: post.category?.color }}>{post.category?.name}</span><h1>{post.title}</h1><p className="article-deck">{post.excerpt}</p><div className="byline"><div className="avatar">{post.author?.avatar ? <img src={post.author.avatar} alt="" /> : post.author?.name?.[0]}</div><div><strong>{post.author?.name}</strong><span>{formatDate(post.publishAt)} · <Clock size={14} /> {post.readingTime} min read</span></div></div></header>
        <div className="container feature-image"><img src={post.featuredImage} alt={post.imageAlt || ''} /></div>
        <div className="container reading-layout">
          <aside className="toc"><strong>In this story</strong>{prepared.headings.map((item) => <a key={item.id} className={item.level === 'H3' ? 'sub' : ''} href={`#${item.id}`}>{item.label}</a>)}<div className="share-row"><button onClick={() => navigator.clipboard.writeText(url)} title="Copy link"><Link2 size={17} /></button><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer"><Linkedin size={17} /></a><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer"><Twitter size={17} /></a></div></aside>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: prepared.html }} />
        </div>
        <div className="container narrow author-box"><div className="avatar large">{post.author?.avatar ? <img src={post.author.avatar} alt="" /> : post.author?.name?.[0]}</div><div><span>Written by</span><h3>{post.author?.name}</h3><p>{post.author?.bio}</p></div></div>
        <nav className="container narrow prev-next">{previous ? <Link to={`/blog/${previous.slug}`}><span><ArrowLeft size={16} /> Previous</span><strong>{previous.title}</strong></Link> : <span />}{next && <Link to={`/blog/${next.slug}`} className="next"><span>Next <ArrowRight size={16} /></span><strong>{next.title}</strong></Link>}</nav>
      </article>
      {!!related.length && <section className="section related-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">Keep exploring</span><h2>Related stories</h2></div></div><div className="article-grid">{related.map((item) => <ArticleCard key={item._id} post={item} />)}</div></div></section>}
    </>
  );
}

