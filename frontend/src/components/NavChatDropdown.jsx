import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

function getStoredToken() {
  return localStorage.getItem('kyurToken');
}

export default function NavChatDropdown() {
  const [showMessages, setShowMessages] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  let myId = null;
  try {
    const token = getStoredToken();
    if (token) myId = JSON.parse(atob(token.split('.')[1])).id;
  } catch {
    console.error('Failed to parse token');
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMessages(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadChats = async () => {
    try {
      const token = getStoredToken();
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data.data || []);
    } catch (e) {
      console.error("Failed to load chats", e);
    }
  };

  useEffect(() => {
    if (showMessages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadChats();
    }
  }, [showMessages]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Filter and map conversations
  const displayChats = conversations
    .filter(conv => {
      const isArchived = conv.archivedBy && conv.archivedBy.includes(myId);
      return showArchived ? isArchived : !isArchived;
    })
    .map(conv => {
      const isReporter = conv.reporter._id === myId;
      const otherUser = isReporter ? conv.finder : conv.reporter;
      const isMuted = conv.mutedBy && conv.mutedBy.includes(myId);
      
      let isUnread = false;
      let msgText = 'No messages yet';
      let msgTime = '';

      if (conv.latestMessage) {
        const isSender = conv.latestMessage.sender === myId;
        isUnread = !isSender && !conv.latestMessage.isRead && !isMuted;
        msgText = conv.latestMessage.content;
        msgTime = formatTime(conv.latestMessage.createdAt);
      }

      return {
        id: conv._id,
        itemId: conv.item?._id || conv.item,
        itemName: conv.item?.title || 'Unknown Item',
        senderName: otherUser?.name || 'Unknown User',
        text: msgText,
        time: msgTime,
        unread: isUnread,
        status: conv.status
      };
    });

  const hasUnread = conversations.some(conv => {
    if (!conv.latestMessage) return false;
    const isArchived = conv.archivedBy && conv.archivedBy.includes(myId);
    const isMuted = conv.mutedBy && conv.mutedBy.includes(myId);
    if (isArchived || isMuted) return false;
    return conv.latestMessage.sender !== myId && !conv.latestMessage.isRead;
  });

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onMouseDown={(e) => {
          e.stopPropagation();
          setShowMessages(!showMessages);
        }}
        className="btn-secondary"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '8px',
          borderRadius: '8px',
          minWidth: '40px',
          minHeight: '40px'
        }}
      >
        <MessageCircle size={22} />
        {hasUnread && (
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            backgroundColor: '#ef4444',
            borderRadius: '50%'
          }} />
        )}
      </button>

      {showMessages && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          width: '320px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              {showArchived ? 'Archived Chats' : 'Chats'}
            </h3>
            <button 
              onClick={() => setShowArchived(!showArchived)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              title={showArchived ? "Show Active Chats" : "Show Archived Chats"}
            >
              <Archive size={18} />
            </button>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {displayChats.length > 0 ? displayChats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => {
                  setShowMessages(false);
                  navigate(`/items/${chat.itemId}?chat=${chat.id}`);
                }}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f5f5f5',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  backgroundColor: chat.unread ? '#f0f7ff' : '#fff',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = chat.unread ? '#f0f7ff' : '#fff'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#666',
                  flexShrink: 0
                }}>
                  {chat.senderName.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontWeight: chat.unread ? 600 : 500, fontSize: '14px', color: '#1a1a1a' }}>{chat.senderName}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>{chat.time}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                    Item: {chat.itemName} {chat.status === 'pending' ? '(Pending)' : ''}
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: chat.unread ? '#1a1a1a' : '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.text}
                  </p>
                </div>
              </div>
            )) : (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                {showArchived ? "No archived chats." : "No active conversations yet."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
