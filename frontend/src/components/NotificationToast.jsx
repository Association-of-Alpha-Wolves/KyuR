import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationToast() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (data.isMuted) return; // Don't notify if muted

      // Exclude notification if the user is currently viewing the conversation
      // We can check the URL for the conversationId query param
      const searchParams = new URLSearchParams(window.location.search);
      const activeChat = searchParams.get('chat');
      
      if (activeChat === data.conversationId) return;

      setNotification({
        title: `New message from ${data.message.sender.name}`,
        body: data.message.content,
        conversationId: data.conversationId,
        itemId: data.message.item
      });

      // Hide after 4 seconds
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    };

    socket.on('new_message_notification', handleNewMessage);

    return () => {
      socket.off('new_message_notification', handleNewMessage);
    };
  }, [socket]);

  if (!notification) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        borderRadius: '12px',
        padding: '16px',
        width: '300px',
        zIndex: 9999,
        border: '1px solid rgba(0,0,0,0.05)',
        cursor: 'pointer',
        animation: 'slideIn 0.3s ease-out'
      }}
      onClick={() => {
        setNotification(null);
        navigate(`/items/${notification.itemId}?chat=${notification.conversationId}`);
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
          {notification.title}
        </h4>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setNotification(null);
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '0 4px' }}
        >
          ✕
        </button>
      </div>
      <p style={{ margin: 0, fontSize: '14px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {notification.body}
      </p>
    </div>
  );
}
