import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CalendarClock, Eye, FileText, Plus, ArrowUpRight } from 'lucide-react';
import api from '../../api.js';
import Loading from '../../components/Loading.jsx';
import { formatDate } from '../../components/ArticleCard.jsx';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/admin/dashboard').then(({ data }) => setData(data)); }, []);
  if (!data) return <Loading label="Loading dashboard" />;
  const cards = [
    ['Total articles', data.stats.total, FileText, 'All content'],
    ['Published', data.stats.published, BarChart3, 'Live on the website'],
    ['Scheduled', data.stats.scheduled, CalendarClock, 'Planned releases'],
    ['Total views', data.stats.views.toLocaleString(), Eye, 'Across all stories']
  ];
  return <div className="admin-page"><div className="admin-page-head"><div><span className="eyebrow">Editorial overview</span><h1>Good to see you.</h1><p>Here is what is happening across your journal.</p></div><Link className="primary-button" to="/admin/posts/new"><Plus size={18} /> New article</Link></div><div className="stat-grid">{cards.map(([label, value, Icon, detail]) => <div className="stat-card" key={label}><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div><i><Icon size={22} /></i></div>)}</div><section className="admin-panel"><div className="panel-head"><div><h2>Recently updated</h2><p>Your team's latest work.</p></div><Link to="/admin/posts">View all <ArrowUpRight size={17} /></Link></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Article</th><th>Category</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>{data.recent.map((post) => <tr key={post._id}><td><strong>{post.title}</strong><small>{post.author?.name}</small></td><td>{post.category?.name}</td><td><span className={`status ${post.status}`}>{post.status}</span></td><td>{formatDate(post.updatedAt)}</td><td><Link to={`/admin/posts/${post._id}/edit`}>Edit</Link></td></tr>)}</tbody></table></div></section></div>;
}

