import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import api from '../api.js';
import ArticleCard, { formatDate } from '../components/ArticleCard.jsx';
import Loading from '../components/Loading.jsx';

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/home').then(({ data }) => setData(data)).catch(() => setError('Unable to load stories right now.')); }, []);

  if (error) return <div className="empty-state">{error}</div>;
  if (!data) return <Loading label="Curating the latest stories" />;
  const lead = data.featured[0] || data.latest[0];
  const side = (data.featured.length > 1 ? data.featured.slice(1, 3) : data.latest.slice(1, 3));

  return (
    <>
      <Helmet><title>Pooja Tech Journal — Ideas that move technology forward</title><meta name="description" content="Technology insights, software engineering guides, emerging trends and industry stories." /></Helmet>
      <section className="hero-section">
        <div className="container hero-heading"><div><span className="eyebrow"><Sparkles size={16} /> Ideas that move technology forward</span><h1>Build smarter.<br /><em>Think further.</em></h1></div><p>Clear thinking for people creating products, writing software and navigating a fast-changing digital world.</p></div>
        {lead && <div className="container lead-grid">
          <Link to={`/blog/${lead.slug}`} className="lead-story">
            <img src={lead.featuredImage} alt={lead.imageAlt || ''} />
            <div className="lead-overlay"><span>{lead.category?.name} · {formatDate(lead.publishAt)}</span><h2>{lead.title}</h2><p>{lead.excerpt}</p><strong>Read the story <ArrowUpRight size={18} /></strong></div>
          </Link>
          <div className="side-stories">{side.map((post) => <ArticleCard key={post._id} post={post} compact />)}</div>
        </div>}
      </section>

      <section className="section categories-strip"><div className="container"><div className="section-heading"><div><span className="eyebrow">Browse by topic</span><h2>Find your next idea</h2></div></div><div className="category-pills">{data.categories.map((category, index) => <Link key={category._id} to={`/blog?category=${category.slug}`}><span>{String(index + 1).padStart(2, '0')}</span>{category.name}<ArrowRight size={17} /></Link>)}</div></div></section>

      <section className="section latest-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">The latest</span><h2>New thinking, regularly</h2></div><Link className="text-link" to="/blog">View all stories <ArrowRight size={18} /></Link></div><div className="article-grid">{data.latest.slice(0, 6).map((post) => <ArticleCard key={post._id} post={post} />)}</div></div></section>

      <section className="section dark-section"><div className="container trending-layout"><div className="trending-copy"><span className="eyebrow light">Most read this week</span><h2>What the tech world is talking about</h2><p>The practical ideas and emerging conversations attracting the most attention from our readers.</p></div><div className="trending-list">{data.trending.map((post, index) => <Link key={post._id} to={`/blog/${post.slug}`}><strong>{String(index + 1).padStart(2, '0')}</strong><div><span>{post.category?.name}</span><h3>{post.title}</h3></div><ArrowUpRight /></Link>)}</div></div></section>

      <section className="newsletter"><div className="container newsletter-inner"><div><span className="eyebrow">Stay curious</span><h2>The best ideas, once a month.</h2><p>No noise. Just thoughtful technology stories and practical guides.</p></div><form onSubmit={(event) => event.preventDefault()}><input type="email" placeholder="you@company.com" required /><button>Join the journal <ArrowRight size={17} /></button></form></div></section>
    </>
  );
}

