import { Link } from 'react-router-dom';
export default function NotFound() { return <div className="empty-state"><span className="eyebrow">404</span><h1>That page wandered off.</h1><p>The story or page you requested does not exist.</p><Link className="primary-button" to="/">Return home</Link></div>; }
