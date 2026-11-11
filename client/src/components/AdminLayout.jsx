import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Tags, LogOut, ExternalLink, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  function signOut() { logout(); navigate('/login'); }

  return (
    <div className="admin-shell">
      <aside className={open ? 'admin-sidebar open' : 'admin-sidebar'}>
        <Link to="/admin" className="brand admin-brand"><span className="brand-mark">P</span><span><strong>Pooja</strong><small>Publisher</small></span></Link>
        <nav>
          <NavLink end to="/admin"><LayoutDashboard size={19} /> Overview</NavLink>
          <NavLink to="/admin/posts"><FileText size={19} /> Articles</NavLink>
          <NavLink to="/admin/taxonomy"><Tags size={19} /> Categories & authors</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <Link to="/" target="_blank"><ExternalLink size={18} /> View website</Link>
          <button onClick={signOut}><LogOut size={18} /> Sign out</button>
          <div className="user-chip"><span>{user?.name?.[0]}</span><div><strong>{user?.name}</strong><small>{user?.role}</small></div></div>
        </div>
      </aside>
      <section className="admin-main">
        <button className="admin-menu" onClick={() => setOpen(!open)}><Menu /></button>
        <Outlet />
      </section>
    </div>
  );
}

