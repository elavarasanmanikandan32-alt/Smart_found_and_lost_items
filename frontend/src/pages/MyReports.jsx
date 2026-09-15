import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const CATEGORIES = [
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

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    status: 'Active',
    type: 'Lost',
  });
  const [editLoading, setEditLoading] = useState(false);

  // Claims Modal State (for Found items)
  const [activeClaimsItem, setActiveClaimsItem] = useState(null);
  const [claimsList, setClaimsList] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimActionLoading, setClaimActionLoading] = useState(null);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState(null);

  // Fetch current user's reports
  const fetchMyReports = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/items/my-reports');
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching my reports:', err);
      setError('Failed to load your reported items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  // Handle direct status change
  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await API.patch(`/items/${itemId}/status`, { status: newStatus });
      setReports((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, status: newStatus } : item
        )
      );
      setSuccessMsg('Item status updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title,
      category: item.category,
      description: item.description,
      location: item.location,
      status: item.status,
      type: item.type,
    });
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const res = await API.put(`/items/${editingItem._id}`, editFormData);
      setReports((prev) =>
        prev.map((item) => (item._id === editingItem._id ? res.data : item))
      );
      setEditingItem(null);
      setSuccessMsg('Report updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Item
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await API.delete(`/items/${deletingItem._id}`);
      setReports((prev) => prev.filter((item) => item._id !== deletingItem._id));
      setDeletingItem(null);
      setSuccessMsg('Item deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Open Claims Modal
  const handleOpenClaims = async (item) => {
    setActiveClaimsItem(item);
    try {
      setClaimsLoading(true);
      const res = await API.get(`/claims/item/${item._id}`);
      setClaimsList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load claims');
    } finally {
      setClaimsLoading(false);
    }
  };

  // Approve or Reject Claim
  const handleUpdateClaimStatus = async (claimId, newStatus) => {
    try {
      setClaimActionLoading(claimId);
      const res = await API.patch(`/claims/${claimId}`, { status: newStatus });

      // Update claims list
      setClaimsList((prev) =>
        prev.map((claim) => {
          if (claim._id === claimId) {
            return { ...claim, status: newStatus };
          }
          // If approved, any other pending claims might have been rejected automatically
          if (newStatus === 'Approved' && claim.status === 'Pending') {
            return { ...claim, status: 'Rejected' };
          }
          return claim;
        })
      );

      // If approved, update the item's status to Claimed in the main list
      if (newStatus === 'Approved') {
        setReports((prev) =>
          prev.map((item) =>
            item._id === activeClaimsItem._id
              ? { ...item, status: 'Claimed' }
              : item
          )
        );
        setActiveClaimsItem((prev) => ({ ...prev, status: 'Claimed' }));
      }

      setSuccessMsg(`Claim has been ${newStatus.toLowerCase()}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update claim status');
    } finally {
      setClaimActionLoading(null);
    }
  };

  return (
    <div className="my-reports-page">
      <div className="page-header">
        <div>
          <h1>My Reported Items</h1>
          <p className="page-subtitle">
            Manage your submissions, track active status, and review claims submitted by community members.
          </p>
        </div>
        <Link to="/report" className="btn btn-primary">
          ➕ Report New Item
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your reports...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="reports-table-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="table-item-cell">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="table-item-thumb"
                          />
                        ) : (
                          <div className="table-item-thumb-fallback">
                            {item.type === 'Lost' ? '🚨' : '✨'}
                          </div>
                        )}
                        <div>
                          <strong>{item.title}</strong>
                          <p className="table-sub-desc">
                            {item.description.length > 50
                              ? `${item.description.substring(0, 50)}...`
                              : item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-sm badge-${item.type.toLowerCase()}`}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.category}</td>
                    <td>📍 {item.location}</td>
                    <td>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <select
                        className={`status-select status-${item.status.toLowerCase()}`}
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Claimed">Claimed</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Report"
                        >
                          Edit
                        </button>

                        {item.type === 'Found' && (
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleOpenClaims(item)}
                            title="View Claims"
                          >
                            Claims
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeletingItem(item)}
                          title="Delete Report"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <h3>You haven't reported any items yet</h3>
          <p>Did you lose an item or find something that belongs to someone else?</p>
          <Link to="/report" className="btn btn-primary">
            Submit Your First Report
          </Link>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Report</h3>
              <button
                className="modal-close-btn"
                onClick={() => setEditingItem(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-title">Title</label>
                  <input
                    type="text"
                    id="edit-title"
                    className="form-control"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="edit-category">Category</label>
                    <select
                      id="edit-category"
                      className="form-control"
                      value={editFormData.category}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          category: e.target.value,
                        })
                      }
                      required
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group flex-1">
                    <label htmlFor="edit-status">Status</label>
                    <select
                      id="edit-status"
                      className="form-control"
                      value={editFormData.status}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Claimed">Claimed</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-location">Location</label>
                  <input
                    type="text"
                    id="edit-location"
                    className="form-control"
                    value={editFormData.location}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        location: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    rows="3"
                    className="form-control"
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    required
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingItem(null)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Claims Modal (Approve / Reject) */}
      {activeClaimsItem && (
        <div className="modal-backdrop" onClick={() => setActiveClaimsItem(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Incoming Claims</h3>
                <p className="modal-subtitle">
                  Item: <strong>{activeClaimsItem.title}</strong>
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setActiveClaimsItem(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {claimsLoading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading claim requests...</p>
                </div>
              ) : claimsList.length > 0 ? (
                <div className="claims-list">
                  {claimsList.map((claim) => (
                    <div key={claim._id} className="claim-card">
                      <div className="claim-card-header">
                        <div className="claimant-info">
                          <strong>{claim.claimantId?.name || 'Claimant'}</strong>
                          <span className="claimant-email">
                            ({claim.claimantId?.email || 'No email'})
                          </span>
                        </div>
                        <span className={`badge badge-claim-${claim.status.toLowerCase()}`}>
                          {claim.status}
                        </span>
                      </div>

                      <div className="claim-card-message">
                        <strong>Claimant Message / Proof:</strong>
                        <p>{claim.message}</p>
                      </div>

                      <div className="claim-card-footer">
                        <span className="claim-date">
                          Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                        </span>

                        {claim.status === 'Pending' && (
                          <div className="claim-actions">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleUpdateClaimStatus(claim._id, 'Approved')}
                              disabled={claimActionLoading === claim._id}
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleUpdateClaimStatus(claim._id, 'Rejected')}
                              disabled={claimActionLoading === claim._id}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No claim requests have been submitted for this item yet.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setActiveClaimsItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="modal-backdrop" onClick={() => setDeletingItem(null)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button
                className="modal-close-btn"
                onClick={() => setDeletingItem(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete{' '}
                <strong>"{deletingItem.title}"</strong>? This will also remove any associated claim requests.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingItem(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
