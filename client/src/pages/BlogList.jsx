import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import api from '../api.js';
import ArticleCard from '../components/ArticleCard.jsx';
import Loading from '../components/Loading.jsx';

export default function BlogList() {
  const [params, setParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.get('search') || '');
  const page = Number(params.get('page') || 1);
  const category = params.get('category') || '';

  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data.categories || [])); }, []);
  useEffect(() => {
    setLoading(true);
    api.get('/posts', { params: Object.fromEntries(params.entries()) }).then(({ data }) => { setPosts(data.posts); setMeta(data); }).finally(() => setLoading(false));
  }, [params]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }
  function submit(event) { event.preventDefault(); update('search', query.trim()); }

  return (
    <>
      <Helmet><title>All Technology Stories | Pooja Tech Journal</title><meta name="description" content="Explore software development, AI, cloud, cybersecurity and technology innovation stories." /></Helmet>
      <section className="page-hero"><div className="container"><span className="eyebrow">Our journal</span><h1>Ideas, guides and<br /><em>field notes.</em></h1><p>Explore practical engineering knowledge and thoughtful perspectives on the technologies changing how we work.</p></div></section>
      <section className="section listing-section"><div className="container">
        <div className="filter-bar"><div className="filter-scroll"><button className={!category ? 'active' : ''} onClick={() => update('category', '')}>All topics</button>{categories.map((item) => <button key={item._id} className={category === item.slug ? 'active' : ''} onClick={() => update('category', item.slug)}>{item.name} <small>{item.count}</small></button>)}</div><form onSubmit={submit}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles" />{params.get('search') && <button type="button" onClick={() => { setQuery(''); update('search', ''); }}><X size={16} /></button>}</form></div>
        <div className="results-label"><strong>{meta.total}</strong> {meta.total === 1 ? 'story' : 'stories'}{params.get('search') ? ` for “${params.get('search')}”` : ''}</div>
        {loading ? <Loading label="Loading stories" /> : posts.length ? <div className="article-grid">{posts.map((post) => <ArticleCard key={post._id} post={post} />)}</div> : <div className="empty-state"><h3>No stories found</h3><p>Try another keyword or choose a different topic.</p></div>}
        {meta.pages > 1 && <div className="pagination"><button disabled={page <= 1} onClick={() => update('page', page - 1)}>Previous</button><span>Page {page} of {meta.pages}</span><button disabled={page >= meta.pages} onClick={() => update('page', page + 1)}>Next</button></div>}
      </div></section>
    </>
  );
}

