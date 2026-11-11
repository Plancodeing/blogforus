import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, Search, X, ArrowUpRight } from 'lucide-react';
import api from '../api.js';

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  function submit(event) {
    event.preventDefault();
    if (search.trim()) navigate(`/blog?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div className="site-shell">
      <div className="announcement">Fresh perspectives for people building tomorrow <ArrowUpRight size={15} /></div>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Pooja Tech Journal home">
            <span className="brand-mark">P</span>
            <span><strong>Pooja</strong><small>Tech Journal</small></span>
          </Link>
          <nav className={open ? 'main-nav open' : 'main-nav'}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/blog">All stories</NavLink>
            {categories.slice(0, 3).map((category) => (
              <Link key={category._id} to={`/blog?category=${category.slug}`}>{category.name.split(' ')[0]}</Link>
            ))}
          </nav>
          <form className="header-search" onSubmit={submit}>
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stories" aria-label="Search stories" />
          </form>
          <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link to="/" className="brand footer-brand"><span className="brand-mark">P</span><span><strong>Pooja</strong><small>Tech Journal</small></span></Link>
            <p>Thoughtful technology insights, practical engineering guides and stories from the teams shaping what comes next.</p>
          </div>
          <div><h4>Explore</h4><Link to="/blog">Latest stories</Link><Link to="/blog?category=software-development">Development</Link><Link to="/blog?category=cloud-computing">Cloud</Link></div>
          <div><h4>Company</h4><a href="mailto:hello@example.com">Contact</a><Link to="/login">Team login</Link><a href="/api/sitemap.xml">Sitemap</a></div>
          <div><h4>Follow</h4><a href="#">LinkedIn</a><a href="#">YouTube</a><a href="#">X / Twitter</a></div>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} Pooja Tech Journal</span><span>Built for curious minds.</span></div>
      </footer>
    </div>
  );
}

