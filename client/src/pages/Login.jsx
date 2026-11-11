import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/admin" replace />;
  async function submit(event) { event.preventDefault(); setLoading(true); setError(''); try { await login(form.email, form.password); navigate('/admin'); } catch (error) { setError(error.response?.data?.message || 'Unable to sign in'); } finally { setLoading(false); } }
  return <div className="login-page"><Helmet><title>Team Login | Pooja Tech Journal</title></Helmet><div className="login-card"><div className="login-brand"><span className="brand-mark">P</span><span><strong>Pooja</strong><small>Publisher</small></span></div><span className="eyebrow">Editorial workspace</span><h1>Welcome back.</h1><p>Sign in to create, schedule and publish stories.</p><form onSubmit={submit}><label>Email address<div><Mail size={18} /><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="editor@company.com" /></div></label><label>Password<div><LockKeyhole size={18} /><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" /></div></label>{error && <div className="form-error">{error}</div>}<button disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={18} /></button></form></div><div className="login-visual"><div><span>Publish with confidence</span><blockquote>“Great technology writing makes complex ideas feel inevitable.”</blockquote></div></div></div>;
}

