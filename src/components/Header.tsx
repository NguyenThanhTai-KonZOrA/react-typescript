import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const loc = useLocation();
  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #eee', marginBottom: '1rem' }}>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: loc.pathname === '/' ? '700' : '400' }}>
          Home
        </Link>
        <Link to="/about" style={{ fontWeight: loc.pathname === '/about' ? '700' : '400' }}>
          About
        </Link>
        <Link to="/HTRForm" style={{ fontWeight: loc.pathname === '/HTRForm' ? '700' : '400' }}>
          HTRForm
        </Link>
      </nav>
    </header>
  );
};

export default Header;
