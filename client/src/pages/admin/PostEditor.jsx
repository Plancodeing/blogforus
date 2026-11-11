import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ImagePlus, Save, Send, Star } from 'lucide-react';
import api from '../../api.js';
import Loading from '../../components/Loading.jsx';

const empty = { title: '', slug: '', excerpt: '', content: '<h2>Start with a clear heading</h2>\n<p>Write your article here...</p>', featuredImage: '', imageAlt: '', category: '', author: '', tags: '', status: 'draft', publishAt: '', featured: false, seoTitle: '', metaDescription: '' };
function toInputDate(value) { if (!value) return ''; const date = new Date(value); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); }

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/admin/categories'), api.get('/admin/authors'), id ? api.get(`/admin/posts/${id}`) : Promise.resolve(null)]).then(([cats, auths, postResult]) => {
      setCategories(cats.data.categories); setAuthors(auths.data.authors);
      if (postResult) { const p = postResult.data.post; setForm({ ...p, category: p.category?._id || p.category, author: p.author?._id || p.author, tags: (p.tags || []).join(', '), publishAt: toInputDate(p.publishAt) }); }
      else setForm((current) => ({ ...current, category: cats.data.categories[0]?._id || '', author: auths.data.authors[0]?._id || '' }));
      setLoading(false);
    });
  }, [id]);

  function set(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  async function uploadImage(event) { const file = event.target.files?.[0]; if (!file) return; const body = new FormData(); body.append('image', file); setMessage('Uploading image…'); try { const { data } = await api.post('/admin/upload', body); set('featuredImage', data.url); setMessage('Image uploaded'); } catch { setError('Image upload failed'); } }
  async function save(statusOverride) {
    if (!form.title || !form.excerpt || !form.content || !form.category || !form.author) { setError('Title, summary, content, category and author are required.'); return; }
    setSaving(true); setError(''); setMessage('');
    const payload = { ...form, status: statusOverride || form.status, tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : null };
    try { const { data } = id ? await api.put(`/admin/posts/${id}`, payload) : await api.post('/admin/posts', payload); setMessage('Article saved'); if (!id) navigate(`/admin/posts/${data.post._id}/edit`, { replace: true }); setForm((current) => ({ ...current, status: data.post.status })); } catch (error) { setError(error.response?.data?.message || 'Unable to save article'); } finally { setSaving(false); }
  }
  if (loading) return <Loading label="Opening editor" />;

  return <div className="admin-page editor-page"><div className="editor-top"><div><Link to="/admin/posts"><ArrowLeft size={17} /> Articles</Link><h1>{id ? 'Edit article' : 'New article'}</h1></div><div className="editor-actions">{message && <span className="save-message"><Check size={15} /> {message}</span>}<button className="secondary-button" disabled={saving} onClick={() => save('draft')}><Save size={17} /> Save draft</button><button className="primary-button" disabled={saving} onClick={() => save(form.publishAt && new Date(form.publishAt) > new Date() ? 'scheduled' : 'published')}><Send size={17} /> {form.publishAt && new Date(form.publishAt) > new Date() ? 'Schedule' : 'Publish'}</button></div></div>{error && <div className="form-error banner">{error}</div>}<div className="editor-grid"><div className="editor-main"><section className="editor-card"><label>Article title<input className="title-input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="A clear, specific headline" /></label><div className="field-row"><label>URL slug<input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="generated-from-title" /></label></div><label>Short description<textarea rows="3" maxLength="320" value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} placeholder="A concise summary for article cards and search results" /><small>{form.excerpt.length}/320</small></label><label>Article content <span>HTML supported</span><textarea className="content-editor" value={form.content} onChange={(e) => set('content', e.target.value)} /></label></section><section className="editor-card"><div className="card-title"><h2>Search appearance</h2><p>Control how this story appears in search results.</p></div><label>SEO title<input maxLength="70" value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} placeholder={form.title || 'SEO page title'} /><small>{form.seoTitle.length}/70</small></label><label>Meta description<textarea rows="3" maxLength="170" value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} placeholder={form.excerpt || 'Search result description'} /><small>{form.metaDescription.length}/170</small></label></section></div><aside className="editor-aside"><section className="editor-card"><div className="card-title"><h2>Publishing</h2></div><label>Status<select value={form.status} onChange={(e) => set('status', e.target.value)}><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="published">Published</option></select></label><label>Publish date and time<input type="datetime-local" value={form.publishAt} onChange={(e) => set('publishAt', e.target.value)} /></label><label className="check-label"><input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} /><span><Star size={18} /> Feature on homepage</span></label></section><section className="editor-card"><div className="card-title"><h2>Organisation</h2></div><label>Category<select value={form.category} onChange={(e) => set('category', e.target.value)}><option value="">Select category</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label><label>Author<select value={form.author} onChange={(e) => set('author', e.target.value)}><option value="">Select author</option>{authors.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label><label>Tags<input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="cloud, architecture, devops" /><small>Separate tags with commas.</small></label></section><section className="editor-card"><div className="card-title"><h2>Featured image</h2></div>{form.featuredImage && <img className="image-preview" src={form.featuredImage} alt="Preview" />}<label className="upload-button"><ImagePlus size={18} /> Upload image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadImage} /></label><label>Or image URL<input value={form.featuredImage} onChange={(e) => set('featuredImage', e.target.value)} placeholder="https://..." /></label><label>Alternative text<input value={form.imageAlt} onChange={(e) => set('imageAlt', e.target.value)} placeholder="Describe the image" /></label></section></aside></div></div>;
}

