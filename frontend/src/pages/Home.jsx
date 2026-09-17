import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import heroImage from '../assets/hero_3d.jpg';
import featureImage from '../assets/features_3d.jpg';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="badge badge-found animate-float">SMART LOST &amp; FOUND</span>
            <h1 className="hero-title">
              Find what’s lost.<br/>
              <span className="text-primary">Return what’s found.</span>
            </h1>
            <p className="hero-description">
              Report lost items, discover found belongings, and connect with the right person — all in one simple, premium platform.
            </p>
            <div className="hero-actions">
              <Link to="/report" className="btn-primary">Report an Item</Link>
              <Link to="/items" className="btn-secondary">Browse Items</Link>
            </div>
          </div>
          
          <div className="hero-visual">
            <img src={heroImage} alt="Floating 3D Objects" className="hero-3d-image animate-float" />
            
            {/* Hero Floating Card */}
            <div className="glass-panel-dark hero-floating-card animate-float-delay">
              <div className="card-header">
                <h3>Recovery Status</h3>
              </div>
              <div className="card-stats-mini">
                <div className="mini-stat">
                  <span className="dot dot-active"></span>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Active Reports</span>
                    <span className="mini-stat-val">128</span>
                  </div>
                </div>
                <div className="mini-stat">
                  <span className="dot dot-found"></span>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Found Items</span>
                    <span className="mini-stat-val">86</span>
                  </div>
                </div>
                <div className="mini-stat">
                  <span className="dot dot-claimed"></span>
                  <div className="mini-stat-info">
                    <span className="mini-stat-label">Successfully Returned</span>
                    <span className="mini-stat-val">64</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="container stats-container">
          <div className="glass-card stat-box">
            <span className="stat-num">01</span>
            <h4>Lost Items</h4>
            <div className="stat-count">128</div>
          </div>
          <div className="glass-card stat-box">
            <span className="stat-num">02</span>
            <h4>Found Items</h4>
            <div className="stat-count">86</div>
          </div>
          <div className="glass-card stat-box">
            <span className="stat-num">03</span>
            <h4>Claimed Items</h4>
            <div className="stat-count">64</div>
          </div>
          <div className="glass-card stat-box">
            <span className="stat-num">04</span>
            <h4>Active Reports</h4>
            <div className="stat-count">150</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-navy-section how-it-works-section" id="how-it-works">
        <div className="container">
          <h2 className="section-title text-center">How Smart Lost &amp; Found Works</h2>
          <div className="steps-grid">
            <div className="glass-panel-dark step-card">
              <div className="step-icon">📝</div>
              <h3>01. Report</h3>
              <p>Tell us what you lost or found with our smart reporting tool.</p>
            </div>
            <div className="glass-panel-dark step-card">
              <div className="step-icon">🔍</div>
              <h3>02. Search</h3>
              <p>Find matching items using smart search and intuitive filters.</p>
            </div>
            <div className="glass-panel-dark step-card">
              <div className="step-icon">✋</div>
              <h3>03. Claim</h3>
              <p>Submit a claim request with a short message describing the item.</p>
            </div>
            <div className="glass-panel-dark step-card">
              <div className="step-icon">🤝</div>
              <h3>04. Recover</h3>
              <p>Connect with the reporter and successfully recover the item.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="features-section">
        <div className="container">
          <div className="features-header">
            <h2 className="section-title">Everything you need to recover your belongings.</h2>
          </div>
          
          <div className="bento-grid">
            <div className="glass-panel bento-card bento-large">
              <h3>Easy Reporting</h3>
              <p>Report lost or found items in seconds with our beautiful and intuitive forms.</p>
              <div className="bento-decor">
                <img src={featureImage} alt="3D Decor" className="animate-float" />
              </div>
            </div>
            
            <div className="glass-panel-dark bento-card bento-small">
              <h3>Powerful Search</h3>
              <p>Search by item name, category and keyword.</p>
            </div>
            
            <div className="glass-panel bento-card bento-small lavender-tint">
              <h3>Smart Filters</h3>
              <p>Filter by type, location, category and status instantly.</p>
            </div>
            
            <div className="glass-panel bento-card bento-medium">
              <h3>Secure Claims</h3>
              <p>Submit and manage claim requests securely. Only the reporter can approve claims.</p>
            </div>
            
            <div className="glass-panel-dark bento-card bento-medium">
              <h3>Track Status</h3>
              <p>Track whether an item is active, claimed or resolved in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="preview-section">
        <div className="container">
          <h2 className="section-title">Recently Reported Items</h2>
          <div className="preview-items-grid">
            <div className="glass-card preview-item">
              <div className="preview-img-placeholder">📱</div>
              <div className="preview-details">
                <span className="badge badge-found">FOUND</span>
                <h4>iPhone 15</h4>
                <p>AMET University • 15 Sep 2026</p>
              </div>
            </div>
            <div className="glass-card preview-item">
              <div className="preview-img-placeholder">💼</div>
              <div className="preview-details">
                <span className="badge badge-lost">LOST</span>
                <h4>Black Wallet</h4>
                <p>Chennai • 14 Sep 2026</p>
              </div>
            </div>
            <div className="glass-card preview-item">
              <div className="preview-img-placeholder">🎒</div>
              <div className="preview-details">
                <span className="badge badge-found">FOUND</span>
                <h4>Blue Backpack</h4>
                <p>College Campus • 13 Sep 2026</p>
              </div>
            </div>
          </div>
          <div className="text-center" style={{marginTop: '40px'}}>
            <Link to="/items" className="btn-secondary">View All Items</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
