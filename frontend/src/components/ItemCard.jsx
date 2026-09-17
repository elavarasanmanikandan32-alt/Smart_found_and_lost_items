import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ItemCard = ({ item, onViewDetails, onClaimItem }) => {
  const { user } = useContext(AuthContext);

  const isOwner = user && item.reportedBy && (
    (typeof item.reportedBy === 'object' && item.reportedBy._id === user._id) ||
    item.reportedBy === user._id
  );

  const isFound = item.type === 'Found';
  const canClaim = isFound && !isOwner && item.status === 'Active';

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Category Icon Fallback
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'electronics':
        return '📱';
      case 'documents':
      case 'id cards':
        return '📄';
      case 'keys':
        return '🔑';
      case 'bags':
      case 'backpack':
        return '🎒';
      case 'clothing':
      case 'apparel':
        return '👕';
      case 'wallets & cards':
      case 'wallet':
        return '👛';
      case 'jewelry':
      case 'accessories':
        return '💍';
      case 'books':
        return '📚';
      default:
        return '📦';
    }
  };

  return (
    <div className={`item-card glass-card ${item.type.toLowerCase()}-card`}>
      <div className="item-card-image-wrapper">
        {item.image ? (
          <img src={item.image} alt={item.title} className="item-card-image" />
        ) : (
          <div className="item-card-image-fallback">
            <span className="fallback-icon">{getCategoryIcon(item.category)}</span>
            <span className="fallback-category">{item.category}</span>
          </div>
        )}
        <div className="card-top-badges">
          <span className={`badge badge-type badge-${item.type.toLowerCase()}`}>
            {item.type}
          </span>
          <span className={`badge badge-status badge-${item.status.toLowerCase()}`}>
            {item.status}
          </span>
        </div>
      </div>

      <div className="item-card-body">
        <div className="item-card-meta">
          <span className="item-category-tag">
            {getCategoryIcon(item.category)} {item.category}
          </span>
          <span className="item-date">📅 {formatDate(item.date)}</span>
        </div>

        <h3 className="item-title" title={item.title}>
          {item.title}
        </h3>

        <p className="item-description">
          {item.description.length > 90
            ? `${item.description.substring(0, 90)}...`
            : item.description}
        </p>

        <div className="item-location">
          <span className="location-pin">📍</span>
          <span className="location-text">{item.location}</span>
        </div>

        {item.reportedBy && (
          <div className="item-reporter">
            <span className="reporter-label">Reported by:</span>
            <span className="reporter-name">
              {typeof item.reportedBy === 'object' ? item.reportedBy.name : 'User'}
            </span>
            {isOwner && <span className="badge badge-owner">You</span>}
          </div>
        )}
      </div>

      <div className="item-card-footer">
        <button
          className="btn btn-secondary btn-sm flex-1"
          onClick={() => onViewDetails(item)}
        >
          View Details
        </button>

        {canClaim && (
          <button
            className="btn btn-primary btn-sm flex-1"
            onClick={() => onClaimItem(item)}
          >
            Claim Item
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
