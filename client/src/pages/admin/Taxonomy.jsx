import { useEffect, useState } from 'react';
import { Plus, Trash2, UserRound, Tags } from 'lucide-react';
import api from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Taxonomy() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [category, setCategory] = useState({ name: '', description: '', color: '#2f6fed' });
  const [author, setAuthor] = useState({ name: '', email: '', bio: '' });
  const [error, setError] = useState('');
  async function load() { const [cats, auths] = await Promise.all([api.get('/admin/categories'), api.get('/admin/authors')]); setCategories(cats.data.categories); setAuthors(auths.data.authors); }
  useEffect(() => { load(); }, []);
  async function addCategory(event) { event.preventDefault(); try { await api.post('/admin/categories', category); setCategory({ name: '', description: '', color: '#2f6fed' }); load(); } catch (e) { setError(e.response?.data?.message || 'Unable to add category'); } }
  async function addAuthor(event) { event.preventDefault(); try { await api.post('/admin/authors', author); setAuthor({ name: '', email: '', bio: '' }); load(); } catch (e) { setError(e.response?.data?.message || 'Unable to add author'); } }
  async function remove(type, id) { if (!confirm(`Delete this ${type}?`)) return; try { await api.delete(`/admin/${type === 'category' ? 'categories' : 'authors'}/${id}`); load(); } catch (e) { setError(e.response?.data?.message || `Unable to delete ${type}`); } }
  return <div className="admin-page"><div className="admin-page-head"><div><span className="eyebrow">Content settings</span><h1>Categories & authors</h1><p>Keep the people and topics behind your journal organised.</p></div></div>{error && <div className="form-error banner">{error}</div>}<div className="taxonomy-grid"><section className="admin-panel"><div className="panel-head"><div><h2><Tags size={20} /> Categories</h2><p>Topics readers can browse.</p></div></div><form className="inline-create" onSubmit={addCategory}><input required value={category.name} onChange={(e) => setCategory({ ...category, name: e.target.value })} placeholder="Category name" /><input type="color" value={category.color} onChange={(e) => setCategory({ ...category, color: e.target.value })} /><button><Plus size={18} /> Add</button></form><div className="manage-list">{categories.map((item) => <div key={item._id}><span className="color-dot" style={{ background: item.color }}></span><div><strong>{item.name}</strong><small>/{item.slug}</small></div>{user?.role === 'admin' && <button onClick={() => remove('category', item._id)}><Trash2 size={16} /></button>}</div>)}</div></section><section className="admin-panel"><div className="panel-head"><div><h2><UserRound size={20} /> Authors</h2><p>People who publish stories.</p></div></div><form className="stack-create" onSubmit={addAuthor}><input required value={author.name} onChange={(e) => setAuthor({ ...author, name: e.target.value })} placeholder="Author name" /><input type="email" value={author.email} onChange={(e) => setAuthor({ ...author, email: e.target.value })} placeholder="Email address" /><textarea value={author.bio} onChange={(e) => setAuthor({ ...author, bio: e.target.value })} placeholder="Short biography" /><button><Plus size={18} /> Add author</button></form><div className="manage-list">{authors.map((item) => <div key={item._id}><span className="avatar small">{item.name[0]}</span><div><strong>{item.name}</strong><small>{item.email || 'No email'}</small></div>{user?.role === 'admin' && <button onClick={() => remove('author', item._id)}><Trash2 size={16} /></button>}</div>)}</div></section></div></div>;
}
