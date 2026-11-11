import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import api from '../../api.js';
import Loading from '../../components/Loading.jsx';
import { formatDate } from '../../components/ArticleCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  async function load() { setLoading(true); const { data } = await api.get('/admin/posts', { params: { search: search || undefined, status: status || undefined } }); setPosts(data.posts); setLoading(false); }
  useEffect(() => { load(); }, [status]);
  async function remove(post) { if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return; await api.delete(`/admin/posts/${post._id}`); setPosts((items) => items.filter((item) => item._id !== post._id)); }
  return <div className="admin-page"><div className="admin-page-head"><div><span className="eyebrow">Content library</span><h1>Articles</h1><p>Create, review, schedule and manage every story.</p></div><Link className="primary-button" to="/admin/posts/new"><Plus size={18} /> New article</Link></div><div className="admin-toolbar"><form onSubmit={(event) => { event.preventDefault(); load(); }}><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles" /></form><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="published">Published</option><option value="scheduled">Scheduled</option><option value="draft">Draft</option></select></div><section className="admin-panel flush">{loading ? <Loading /> : <div className="admin-table-wrap"><table className="admin-table posts-table"><thead><tr><th>Article</th><th>Author</th><th>Status</th><th>Publish date</th><th>Views</th><th>Actions</th></tr></thead><tbody>{posts.map((post) => <tr key={post._id}><td><div className="table-article">{post.featuredImage && <img src={post.featuredImage} alt="" />}<div><strong>{post.title}</strong><small>{post.category?.name}</small></div></div></td><td>{post.author?.name}</td><td><span className={`status ${post.status}`}>{post.status}</span></td><td>{post.publishAt ? formatDate(post.publishAt) : '—'}</td><td>{post.views}</td><td><div className="table-actions"><Link title="Edit" to={`/admin/posts/${post._id}/edit`}><Edit3 size={17} /></Link>{user?.role === 'admin' && <button title="Delete" onClick={() => remove(post)}><Trash2 size={17} /></button>}</div></td></tr>)}</tbody></table>{!posts.length && <div className="empty-state small"><h3>No articles yet</h3><p>Create your first story to get started.</p></div>}</div>}</section></div>;
}

