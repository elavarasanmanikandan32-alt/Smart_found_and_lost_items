import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Claims = () => {
  const [activeTab, setActiveTab] = useState('submitted'); // 'submitted' or 'received'
  const [myClaims, setMyClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchClaimsData = async () => {
    try {
      setLoading(true);
      setError('');
      const [myRes, recRes] = await Promise.all([
        API.get('/claims/my'),
        API.get('/claims/received'),
      ]);
      setMyClaims(myRes.data);
      setReceivedClaims(recRes.data);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Failed to load claims data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimsData();
  }, []);

  const handleUpdateClaimStatus = async (claimId, newStatus) => {
    try {
      setActionLoading(claimId);
      await API.patch(`/claims/${claimId}`, { status: newStatus });
      setSuccessMsg(`Claim successfully ${newStatus.toLowerCase()}`);

      // Refresh claims data
      const recRes = await API.get('/claims/received');
      setReceivedClaims(recRes.data);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update claim');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="claims-page">
      <div className="page-header">
        <div>
          <h1>Claims Management</h1>
          <p className="page-subtitle">
            Track claims you submitted on found items, and manage claim requests submitted by others on items you found.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Tabs */}
      <div className="claims-tabs">
        <button
          className={`tab-btn ${activeTab === 'submitted' ? 'active' : ''}`}
          onClick={() => setActiveTab('submitted')}
        >
          📤 My Submitted Claims ({myClaims.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          📥 Incoming Claims on My Found Items ({receivedClaims.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading claims...</p>
        </div>
      ) : activeTab === 'submitted' ? (
        /* Tab 1: My Submitted Claims */
        myClaims.length > 0 ? (
          <div className="claims-grid">
            {myClaims.map((claim) => (
              <div key={claim._id} className="claim-card">
                <div className="claim-card-header">
                  <div>
                    <h4>{claim.itemId?.title || 'Item details unavailable'}</h4>
                    <span className="claim-item-sub">
                      Category: {claim.itemId?.category || 'N/A'} • 📍 {claim.itemId?.location || 'N/A'}
                    </span>
                  </div>
                  <span className={`badge badge-claim-${claim.status.toLowerCase()}`}>
                    {claim.status}
                  </span>
                </div>

                <div className="claim-card-message">
                  <strong>Your Proof / Message:</strong>
                  <p>{claim.message}</p>
                </div>

                <div className="claim-card-footer">
                  <span className="claim-date">
                    Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                  {claim.itemId?.reportedBy && (
                    <span className="reporter-contact">
                      Reported by: {claim.itemId.reportedBy.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📂</span>
            <h3>No claims submitted yet</h3>
            <p>If you recognize any item you lost in the Found listings, submit a claim request!</p>
            <Link to="/items" className="btn btn-primary">
              Browse Found Items
            </Link>
          </div>
        )
      ) : (
        /* Tab 2: Received Claims */
        receivedClaims.length > 0 ? (
          <div className="claims-grid">
            {receivedClaims.map((claim) => (
              <div key={claim._id} className="claim-card">
                <div className="claim-card-header">
                  <div>
                    <h4>Item: {claim.itemId?.title || 'Item'}</h4>
                    <div className="claimant-info">
                      <span>Claimed by: <strong>{claim.claimantId?.name}</strong></span>
                      <span className="claimant-email">({claim.claimantId?.email})</span>
                    </div>
                  </div>
                  <span className={`badge badge-claim-${claim.status.toLowerCase()}`}>
                    {claim.status}
                  </span>
                </div>

                <div className="claim-card-message">
                  <strong>Claimant's Proof of Ownership:</strong>
                  <p>{claim.message}</p>
                </div>

                <div className="claim-card-footer">
                  <span className="claim-date">
                    Date: {new Date(claim.createdAt).toLocaleDateString()}
                  </span>

                  {claim.status === 'Pending' ? (
                    <div className="claim-actions">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleUpdateClaimStatus(claim._id, 'Approved')}
                        disabled={actionLoading === claim._id}
                      >
                        ✓ Approve Claim
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleUpdateClaimStatus(claim._id, 'Rejected')}
                        disabled={actionLoading === claim._id}
                      >
                        ✕ Reject Claim
                      </button>
                    </div>
                  ) : (
                    <span className="claim-decided-text">
                      Marked as {claim.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No incoming claim requests</h3>
            <p>When someone claims one of the items you reported finding, their request will appear here.</p>
          </div>
        )
      )}
    </div>
  );
};

export default Claims;
