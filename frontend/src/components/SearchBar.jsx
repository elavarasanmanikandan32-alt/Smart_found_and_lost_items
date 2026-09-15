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
    <div className="search-filter-card">
      <div className="search-filter-grid">
        {/* Search Keyword */}
        <div className="filter-group search-input-group">
          <label htmlFor="search" className="filter-label">
            Search Keyword
          </label>
          <div className="input-with-icon">
            <span className="input-icon">🔍</span>
            <input
              type="text"
              id="search"
              name="search"
              className="form-control"
              placeholder="Search by title or description..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Item Type */}
        <div className="filter-group">
          <label htmlFor="type" className="filter-label">
            Type
          </label>
          <select
            id="type"
            name="type"
            className="form-control"
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
          <label htmlFor="category" className="filter-label">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="form-control"
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
          <label htmlFor="status" className="filter-label">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="form-control"
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
          <label htmlFor="location" className="filter-label">
            Location
          </label>
          <div className="input-with-icon">
            <span className="input-icon">📍</span>
            <input
              type="text"
              id="location"
              name="location"
              className="form-control"
              placeholder="e.g. Library, AMET..."
              value={filters.location}
              onChange={(e) => onFilterChange('location', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="search-filter-actions">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onResetFilters}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
