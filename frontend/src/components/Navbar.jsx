import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="navbar-wrapper">
      <header className="navbar glass-panel">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <div className="brand-icon-wrapper">
              <span className="brand-icon">📦</span>
            </div>
            <span className="brand-text">Smart Lost &amp; Found</span>
          </Link>

          {/* Navigation Links */}
          <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>Dashboard</NavLink>
                <NavLink to="/items" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>Browse Items</NavLink>
                <NavLink to="/report" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>Report Item</NavLink>
                <NavLink to="/my-reports" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>My Reports</NavLink>
                <NavLink to="/claims" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>Claims</NavLink>
                {user?.role === 'admin' && (
                  <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active admin-nav-link' : 'nav-link admin-nav-link')} onClick={closeMenu}>
                    🛡️ Admin Panel
                  </NavLink>
                )}
              </>
            ) : (
              <>
                <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>Home</NavLink>
                <NavLink to="/items" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>Browse Items</NavLink>
                <NavLink to="/report" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>Report Item</NavLink>
                <a href="#how-it-works" className="nav-link" onClick={closeMenu}>How It Works</a>
              </>
            )}
          </nav>

          <div className="navbar-right">
             {isAuthenticated ? (
               <>
                <NotificationDropdown />
                <div className="user-profile-badge">
                  <span className="user-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                  <span className="user-name">{user?.name || 'User'}</span>
                  {user?.role === 'admin' && <span className="badge badge-found" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>Admin</span>}
                </div>
                <button className="btn-secondary" style={{padding: '8px 16px', fontSize: '0.9rem'}} onClick={handleLogout}>
                  Logout
                </button>
               </>
             ) : (
               <>
                <NavLink to="/login" className="nav-link nav-login" onClick={closeMenu}>Login</NavLink>
                <NavLink to="/register" className="btn-primary" style={{padding: '10px 20px', fontSize: '0.95rem'}} onClick={closeMenu}>
                  Get Started
                </NavLink>
               </>
             )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
