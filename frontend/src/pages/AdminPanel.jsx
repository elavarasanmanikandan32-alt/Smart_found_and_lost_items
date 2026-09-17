import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ChatBox from '../components/ChatBox';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'pickup' | 'all' | 'chat'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    pendingApprovals: 0,
    approvedItems: 0,
    rejectedItems: 0,
    readyForPickupCount: 0,
    pendingClaims: 0,
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Approval / Rejection Modal State
  const [actionItem, setActionItem] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' | 'reject' | 'pickup'
  const [adminNote, setAdminNote] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Central Lost & Found Desk, Room 102');
  const [actionLoading, setActionLoading] = useState(false);

  // Dedicated ChatBox Modal for any specific item
  const [activeChatItem, setActiveChatItem] = useState(null);

  // Chat State for Admin
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatReply, setChatReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Fetch admin stats
  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  // Fetch items based on current active tab
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      let statusQuery = 'All';
      let readyQuery = 'All';

      if (activeTab === 'review') {
        statusQuery = 'Pending';
      } else if (activeTab === 'pickup') {
        readyQuery = 'true';
      }

      const res = await API.get(`/admin/items?approvalStatus=${statusQuery}&readyForPickup=${readyQuery}`);
      setItems(res.data);
    } catch (err) {
      setError('Failed to load items list');
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversations for chat tab
  const fetchConversations = async () => {
    try {
      const res = await API.get('/chat/conversations');
      setConversations(res.data);
      if (res.data.length > 0 && !selectedConversation) {
        handleSelectConversation(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      fetchConversations();
    } else {
      fetchItems();
    }
  }, [activeTab]);

  // Handle Conversation selection
  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    try {
      const res = await API.get(`/chat/messages/${conv.item._id}`);
      setChatMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  // Admin reply in Chat Center
  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!chatReply.trim() || !selectedConversation || sendingReply) return;

    try {
      setSendingReply(true);
      const res = await API.post('/chat/messages', {
        itemId: selectedConversation.item._id,
        message: chatReply.trim(),
      });
      setChatMessages((prev) => [...prev, res.data]);
      setChatReply('');
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  // Execute Approve, Reject, or Pickup Dispatch
  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!actionItem) return;

    try {
      setActionLoading(true);
      setError('');

      if (actionType === 'approve') {
        await API.patch(`/admin/items/${actionItem._id}/approve`, {
          adminNotes: adminNote,
        });
        setSuccessMsg(`Item "${actionItem.title}" has been approved and published!`);
      } else if (actionType === 'reject') {
        await API.patch(`/admin/items/${actionItem._id}/reject`, {
          reason: adminNote,
        });
        setSuccessMsg(`Item "${actionItem.title}" was rejected and the user notified.`);
      } else if (actionType === 'pickup') {
        await API.patch(`/admin/items/${actionItem._id}/pickup-ready`, {
          location: pickupLocation,
          message: adminNote,
        });
        setSuccessMsg(
          `Pickup notice dispatched! User notified to collect "${actionItem.title}".`
        );
      }

      setActionItem(null);
      setAdminNote('');
      fetchStats();
      fetchItems();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete action');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <span className="report-badge">🛡️ Administration Center</span>
          <h1>Admin Control Panel</h1>
          <p className="page-subtitle">
            Review submitted reports, dispatch pickup notifications, and directly message users regarding lost &amp; found items.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div
          className="stat-card stat-lost clickable"
          onClick={() => setActiveTab('review')}
        >
          <div className="stat-icon-wrapper">
            <span>⏳</span>
          </div>
          <div className="stat-details">
            <span className="stat-label">Pending Reviews</span>
            <span className="stat-value">{stats.pendingApprovals}</span>
            <span className="stat-hint">Needs admin action</span>
          </div>
        </div>

        <div
          className="stat-card stat-found clickable"
          onClick={() => setActiveTab('all')}
        >
          <div className="stat-icon-wrapper">
            <span>✓</span>
          </div>
          <div className="stat-details">
            <span className="stat-label">Approved Items</span>
            <span className="stat-value">{stats.approvedItems}</span>
            <span className="stat-hint">Publicly listed</span>
          </div>
        </div>

        <div
          className="stat-card stat-claimed clickable"
          onClick={() => setActiveTab('pickup')}
        >
          <div className="stat-icon-wrapper">
            <span>📦</span>
          </div>
          <div className="stat-details">
            <span className="stat-label">Ready for Pickup</span>
            <span className="stat-value">{stats.readyForPickupCount}</span>
            <span className="stat-hint">Awaiting collection</span>
          </div>
        </div>

        <div
          className="stat-card stat-active clickable"
          onClick={() => setActiveTab('chat')}
        >
          <div className="stat-icon-wrapper">
            <span>💬</span>
          </div>
          <div className="stat-details">
            <span className="stat-label">Inquiry Chat</span>
            <span className="stat-value">Live</span>
            <span className="stat-hint">Direct user requests</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="claims-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          ⏳ Pending Approvals ({stats.pendingApprovals})
        </button>
        <button
          className={`tab-btn ${activeTab === 'pickup' ? 'active' : ''}`}
          onClick={() => setActiveTab('pickup')}
        >
          📦 Collection &amp; Pickup Notices ({stats.readyForPickupCount})
        </button>
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          📂 All Items Directory ({stats.totalItems})
        </button>
        <button
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Admin Chat Center
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'chat' ? (
        /* CHAT CENTER */
        <div className="admin-chat-grid glass-panel">
          <div className="chat-threads-sidebar">
            <h4 className="sidebar-title">Active User Inquiries</h4>
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.item._id}
                  className={`chat-thread-item ${
                    selectedConversation?.item._id === conv.item._id ? 'active' : ''
                  }`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="thread-avatar">
                    {conv.item.type === 'Lost' ? '🚨' : '✨'}
                  </div>
                  <div className="thread-content">
                    <strong>{conv.item.title}</strong>
                    <span className="thread-user">User: {conv.item.reportedBy?.name}</span>
                    <p className="thread-last-msg">
                      {conv.lastMessage?.message || 'Started inquiry...'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="badge badge-lost unread-pill">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="chatbox-empty">
                <span>💬</span>
                <p>No user inquiries yet.</p>
              </div>
            )}
          </div>

          <div className="chat-main-view">
            {selectedConversation ? (
              <>
                <div className="chat-main-header">
                  <div>
                    <h4>{selectedConversation.item.title}</h4>
                    <span className="chat-sub">
                      Reporter: {selectedConversation.item.reportedBy?.name} (
                      {selectedConversation.item.reportedBy?.email}) • 📍{' '}
                      {selectedConversation.item.location}
                    </span>
                  </div>
                  <span
                    className={`badge badge-${selectedConversation.item.type.toLowerCase()}`}
                  >
                    {selectedConversation.item.type}
                  </span>
                </div>

                <div className="chat-messages-container">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`chat-bubble-row ${
                          msg.isAdmin ? 'from-user' : 'from-admin'
                        }`}
                      >
                        <div
                          className={`chat-bubble ${
                            msg.isAdmin ? 'bubble-user' : 'bubble-admin'
                          }`}
                        >
                          <div className="bubble-header">
                            <span className="bubble-sender">
                              {msg.isAdmin
                                ? 'You (Administrator)'
                                : msg.sender?.name || 'User'}
                            </span>
                            <span className="bubble-time">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="bubble-text">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="chatbox-empty">
                      <p>Start conversation with the user regarding this item.</p>
                    </div>
                  )}
                </div>

                {/* Quick Templates for Admin */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '8px 20px 0',
                    overflowX: 'auto',
                    background: '#fff',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Quick Message:
                  </span>
                  {[
                    'I will inform you if I found it.',
                    'Our team is checking inventory for matches.',
                    'Your item was found! Please visit the Lost & Found desk to collect.',
                  ].map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setChatReply(tpl)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '10px',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        background: 'rgba(59, 130, 246, 0.05)',
                        color: '#2563eb',
                        cursor: 'pointer',
                      }}
                    >
                      💬 {tpl}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendAdminReply} className="chatbox-input-form">
                  <input
                    type="text"
                    className="glass-input chat-input"
                    placeholder="Reply as Administrator to the user..."
                    value={chatReply}
                    onChange={(e) => setChatReply(e.target.value)}
                    disabled={sendingReply}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-send"
                    disabled={sendingReply || !chatReply.trim()}
                  >
                    {sendingReply ? '...' : 'Send Reply'}
                  </button>
                </form>
              </>
            ) : (
              <div className="chatbox-empty" style={{ margin: 'auto' }}>
                <p>Select an inquiry on the left to start chatting</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ITEMS TABLE / CARDS */
        loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading items queue...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="reports-table-card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Reporter</th>
                    <th>Approval Status</th>
                    <th>Collection Status</th>
                    <th>Date</th>
                    <th>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
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
                              📍 {item.location} • {item.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${item.type.toLowerCase()}`}>
                          {item.type}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong>{item.reportedBy?.name || 'Unknown'}</strong>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {item.reportedBy?.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.approvalStatus === 'Approved'
                              ? 'badge-found'
                              : item.approvalStatus === 'Rejected'
                              ? 'badge-lost'
                              : 'badge-active'
                          }`}
                        >
                          {item.approvalStatus || 'Pending'}
                        </span>
                      </td>
                      <td>
                        {item.readyForPickup ? (
                          <span className="badge badge-claimed">
                            📦 Ready for Pickup
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Not ready
                          </span>
                        )}
                      </td>
                      <td>
                        {new Date(item.date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <div className="table-actions">
                          {item.approvalStatus !== 'Approved' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                setActionItem(item);
                                setActionType('approve');
                                setAdminNote(
                                  item.type === 'Lost'
                                    ? 'Your lost item request has been approved. I will inform you if I found it.'
                                    : `Your reported found item "${item.title}" has been reviewed and approved!`
                                );
                              }}
                              title="Approve Report"
                            >
                              ✓ Approve
                            </button>
                          )}

                          {item.approvalStatus !== 'Rejected' && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setActionItem(item);
                                setActionType('reject');
                                setAdminNote('');
                              }}
                              title="Reject Report"
                            >
                              ✕ Reject
                            </button>
                          )}

                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setActionItem(item);
                              setActionType('pickup');
                              setAdminNote(
                                `Great news! Your lost item "${item.title}" has been found and recovered. Please come and collect your lost item!`
                              );
                            }}
                            title="Dispatch Pickup Notice to User"
                          >
                            📢 Notify Pickup
                          </button>

                          {/* Admin Exclusive Chat Box for this specific item */}
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ borderColor: '#3b82f6', color: '#2563eb' }}
                            onClick={() => setActiveChatItem(item)}
                            title="Open Admin Chatbox to message user"
                          >
                            💬 Admin Chat
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
            <span className="empty-icon">🎉</span>
            <h3>No items in this queue</h3>
            <p>All items have been processed or no submissions match this filter.</p>
          </div>
        )
      )}

      {/* Action Modal (Approve, Reject, or Notify Pickup) */}
      {actionItem && (
        <div className="modal-backdrop" onClick={() => setActionItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>
                  {actionType === 'approve' && 'Approve Item Submission'}
                  {actionType === 'reject' && 'Reject Item Submission'}
                  {actionType === 'pickup' && '📢 Notify User: Come Collect Item'}
                </h3>
                <p className="modal-subtitle">
                  Item: <strong>{actionItem.title}</strong> • Owner:{' '}
                  <strong>{actionItem.reportedBy?.name}</strong> ({actionItem.type})
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setActionItem(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAction}>
              <div className="modal-body">
                {actionType === 'pickup' && (
                  <div className="form-group">
                    <label>Pickup Location / Desk Address:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="e.g. Central Lost & Found Desk, Admin Office Room 102"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>
                    {actionType === 'approve' && 'Approval Message to User:'}
                    {actionType === 'reject' && 'Reason for Rejection (Visible to User):'}
                    {actionType === 'pickup' && 'Notification Message Sent to User:'}
                  </label>

                  {/* Quick message templates for approval */}
                  {actionType === 'approve' && (
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Templates:</span>
                      {[
                        'Your lost item request has been approved. I will inform you if I found it.',
                        'Report approved. We will actively search matching inventory and notify you.',
                        'Item approved and listed in the active directory.',
                      ].map((tpl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAdminNote(tpl)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            border: '1px solid #93c5fd',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            cursor: 'pointer',
                          }}
                        >
                          📌 {tpl.substring(0, 36)}...
                        </button>
                      ))}
                    </div>
                  )}

                  <textarea
                    rows="4"
                    className="form-control"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={
                      actionType === 'reject'
                        ? 'e.g. Incomplete details, duplicate entry, or image unreadable...'
                        : 'Custom message or collection guidelines...'
                    }
                    required={actionType === 'reject'}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActionItem(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${
                    actionType === 'approve'
                      ? 'btn-success'
                      : actionType === 'reject'
                      ? 'btn-danger'
                      : 'btn-primary'
                  }`}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? 'Processing...'
                    : actionType === 'approve'
                    ? 'Confirm Approval'
                    : actionType === 'reject'
                    ? 'Confirm Rejection'
                    : 'Dispatch Collection Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Exclusive ChatBox Modal */}
      {activeChatItem && (
        <ChatBox
          itemId={activeChatItem._id}
          itemTitle={activeChatItem.title}
          onClose={() => setActiveChatItem(null)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
