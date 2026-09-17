import React from 'react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Documents',
  'Keys',
  'Wallets & Cards',
  'Bags',
  'Clothing',
  'Jewelry',
  'Books',
  'Other',
];

const SearchBar = ({ filters, onFilterChange, onResetFilters }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Looking for something?</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
        
        {/* Search Keyword */}
        <div className="filter-group">
          <label htmlFor="search" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
            Search Keyword
          </label>
          <input
            type="text"
            id="search"
            name="search"
            className="glass-input"
            placeholder="Search lost or found items..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>

        {/* Item Type */}
        <div className="filter-group">
          <label htmlFor="type" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
            Type
          </label>
          <select
            id="type"
            name="type"
            className="glass-input"
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>

        {/* Category */}
        <div className="filter-group">
          <label htmlFor="category" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
            Category
          </label>
          <select
            id="category"
            name="category"
            className="glass-input"
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="filter-group">
          <label htmlFor="status" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
            Status
          </label>
          <select
            id="status"
            name="status"
            className="glass-input"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Claimed">Claimed</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Location */}
        <div className="filter-group">
          <label htmlFor="location" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            className="glass-input"
            placeholder="Enter location..."
            value={filters.location}
            onChange={(e) => onFilterChange('location', e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          onClick={onResetFilters}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
