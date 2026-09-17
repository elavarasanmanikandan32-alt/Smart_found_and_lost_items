import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await API.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case 'pickup':
        return <span className="badge badge-claimed">📦 Collection Ready</span>;
      case 'approval':
        return <span className="badge badge-found">✓ Approved</span>;
      case 'rejection':
        return <span className="badge badge-lost">✕ Rejected</span>;
      case 'chat':
        return <span className="badge badge-active">💬 Message</span>;
      default:
        return <span className="badge badge-active">Notice</span>;
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown glass-panel">
          <div className="notification-header">
            <h4>Notifications {unreadCount > 0 && `(${unreadCount})`}</h4>
            {unreadCount > 0 && (
              <button
                className="btn-link"
                onClick={handleMarkAllRead}
                disabled={loading}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`notification-item ${!item.isRead ? 'unread' : ''}`}
                  onClick={() => !item.isRead && handleMarkAsRead(item._id)}
                >
                  <div className="notification-item-header">
                    {getNotificationBadge(item.type)}
                    <span className="notification-time">
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h5 className="notification-title">{item.title}</h5>
                  <p className="notification-message">{item.message}</p>
                </div>
              ))
            ) : (
              <div className="notification-empty">
                <span>🔕</span>
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
