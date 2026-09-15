import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';

const Items = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [filters, setFilters] = useState({
    search: '',
    type: 'All',
    category: 'All',
    location: '',
    status: 'All',
  });

  // Modal States
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimingItem, setClaimingItem] = useState(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState({ type: '', message: '' });

  // Fetch Items from Backend with Query Parameters
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.type && filters.type !== 'All') params.append('type', filters.type);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);

      const res = await API.get(`/items?${params.toString()}`);
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced/Triggered search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'All',
      category: 'All',
      location: '',
      status: 'All',
    });
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
  };

  const handleOpenClaimModal = (item) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/items' } } });
      return;
    }
    setClaimingItem(item);
    setClaimMessage('');
    setClaimFeedback({ type: '', message: '' });
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimMessage.trim()) {
      setClaimFeedback({
        type: 'error',
        message: 'Please provide proof or reason for your claim',
      });
      return;
    }

    try {
      setClaimSubmitting(true);
      setClaimFeedback({ type: '', message: '' });

      await API.post('/claims', {
        itemId: claimingItem._id,
        message: claimMessage,
      });

      setClaimFeedback({
        type: 'success',
        message: 'Claim request submitted successfully! The reporter will review it.',
      });

      setTimeout(() => {
        setClaimingItem(null);
        setClaimFeedback({ type: '', message: '' });
      }, 2000);
    } catch (err) {
      setClaimFeedback({
        type: 'error',
        message:
          err.response?.data?.message || 'Failed to submit claim. Please try again.',
      });
    } finally {
      setClaimSubmitting(false);
    }
  };

  return (
    <div className="items-page">
      <div className="page-header">
        <div>
          <h1>Browse Lost &amp; Found Items</h1>
          <p className="page-subtitle">
            Search our centralized registry or filter by category and location to locate missing items.
          </p>
        </div>
      </div>

      {/* Real Backend Search and Filter Bar */}
      <SearchBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {error && <div className="alert alert-error">{error}</div>}

      {/* Items Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading items...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="items-grid">
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onViewDetails={handleViewDetails}
              onClaimItem={handleOpenClaimModal}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No items match your criteria</h3>
          <p>Try resetting filters or adjusting your keyword search.</p>
          <button className="btn btn-outline" onClick={handleResetFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className={`badge badge-${selectedItem.type.toLowerCase()}`}>
                  {selectedItem.type}
                </span>
                <span className={`badge badge-${selectedItem.status.toLowerCase()}`}>
                  {selectedItem.status}
                </span>
                <h3>{selectedItem.title}</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {selectedItem.image && (
                <div className="modal-image-wrapper">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="modal-image"
                  />
                </div>
              )}

              <div className="detail-list">
                <div className="detail-item">
                  <strong>Category:</strong>
                  <span>{selectedItem.category}</span>
                </div>
                <div className="detail-item">
                  <strong>Location:</strong>
                  <span>📍 {selectedItem.location}</span>
                </div>
                <div className="detail-item">
                  <strong>Date:</strong>
                  <span>
                    📅 {new Date(selectedItem.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Reported By:</strong>
                  <span>
                    {typeof selectedItem.reportedBy === 'object'
                      ? `${selectedItem.reportedBy.name} (${selectedItem.reportedBy.email})`
                      : 'Community Member'}
                  </span>
                </div>
              </div>

              <div className="detail-description">
                <strong>Description:</strong>
                <p>{selectedItem.description}</p>
              </div>
            </div>

            <div className="modal-footer">
              {selectedItem.type === 'Found' && selectedItem.status === 'Active' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const it = selectedItem;
                    setSelectedItem(null);
                    handleOpenClaimModal(it);
                  }}
                >
                  Claim This Item
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Request Modal */}
      {claimingItem && (
        <div className="modal-backdrop" onClick={() => setClaimingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Submit Claim Request</h3>
                <p className="modal-subtitle">
                  Item: <strong>{claimingItem.title}</strong>
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setClaimingItem(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitClaim}>
              <div className="modal-body">
                {claimFeedback.message && (
                  <div className={`alert alert-${claimFeedback.type}`}>
                    {claimFeedback.message}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="claim-message">
                    Proof / Description of Ownership:
                  </label>
                  <textarea
                    id="claim-message"
                    rows="4"
                    className="form-control"
                    placeholder="Provide details only the true owner would know (e.g. serial number, lock screen wallpaper, specific scratches, contents inside)..."
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setClaimingItem(null)}
                  disabled={claimSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={claimSubmitting}
                >
                  {claimSubmitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
