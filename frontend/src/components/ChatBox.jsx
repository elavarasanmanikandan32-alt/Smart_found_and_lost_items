import React, { useState, useEffect, useRef, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const QUICK_TEMPLATES = [
  'I will inform you if I found it.',
  'Our team is searching recent inventory for matches.',
  'Your item was recovered and is ready for collection!',
  'Please visit the Lost & Found desk with your ID to collect.',
];

const ChatBox = ({ itemId, itemTitle, onClose }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/chat/messages/${itemId}`);
      setMessages(res.data.messages || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!itemId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // 4s polling
    return () => clearInterval(interval);
  }, [itemId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      setError('');
      const res = await API.post('/chat/messages', {
        itemId,
        message: inputText.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
      setInputText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleApplyTemplate = (tpl) => {
    setInputText(tpl);
  };

  return (
    <div className="chatbox-modal-backdrop" onClick={onClose}>
      <div className="chatbox-container glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="chatbox-header">
          <div className="chatbox-header-info">
            <span className="chatbox-icon">{isAdmin ? '🛡️' : '📢'}</span>
            <div>
              <h4>{isAdmin ? 'Admin Messaging Console' : 'Official Admin Updates & Notices'}</h4>
              <p className="chatbox-subtitle">{itemTitle || 'Item Request'}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="alert alert-error" style={{ margin: '12px 16px' }}>{error}</div>}

        {/* Regular User Notice Banner */}
        {!isAdmin && (
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #475569)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🔒</span>
            <span>
              <strong>Admin Broadcast Channel:</strong> Administrators post verified status updates and collection instructions here.
            </span>
          </div>
        )}

        <div className="chatbox-messages">
          {loading && messages.length === 0 ? (
            <div className="chatbox-loading">
              <div className="spinner" style={{ width: 28, height: 28 }}></div>
              <p>Loading conversation history...</p>
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat-bubble-row ${msg.isAdmin ? 'from-admin' : 'from-user'}`}
              >
                <div className={`chat-bubble ${msg.isAdmin ? 'bubble-admin' : 'bubble-user'}`}>
                  <div className="bubble-header">
                    <span className="bubble-sender">
                      {msg.isAdmin ? '🛡️ Administrator' : msg.sender?.name || 'User'}
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
              <span style={{ fontSize: 36 }}>{isAdmin ? '💬' : '⏳'}</span>
              <p>{isAdmin ? 'No messages dispatched yet.' : 'No admin updates yet.'}</p>
              <span>
                {isAdmin
                  ? 'Send a message or inform the user if their lost item is found.'
                  : 'Your administrator will inform you here once your lost item request is reviewed or found.'}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Admin Input Form with Templates */}
        {isAdmin ? (
          <div className="admin-chat-composer" style={{ borderTop: '1px solid rgba(0,0,0,0.08)', background: '#fff' }}>
            {/* Quick Templates */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                padding: '8px 16px 0',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {QUICK_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    background: 'rgba(59, 130, 246, 0.05)',
                    color: '#2563eb',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Click to insert template"
                >
                  💬 {tpl}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="chatbox-input-form">
              <input
                type="text"
                className="glass-input chat-input"
                placeholder="Type update or status for the user..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="btn btn-primary btn-send"
                disabled={sending || !inputText.trim()}
              >
                {sending ? '...' : 'Send'}
              </button>
            </form>
          </div>
        ) : (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'rgba(248, 250, 252, 0.9)',
              textAlign: 'center',
              fontSize: '0.82rem',
              color: 'var(--text-muted, #64748b)',
            }}
          >
            🔒 Chat input is restricted to administrators. Updates will automatically appear above.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
