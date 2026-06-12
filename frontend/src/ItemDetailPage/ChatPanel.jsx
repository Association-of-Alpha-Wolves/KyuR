import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'

export default function ChatPanel({ itemId, conversationId: initialConvId, currentUserId, reporterId, socket }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [error, setError] = useState('')
  const [conversation, setConversation] = useState(null)
  const [activeConvId, setActiveConvId] = useState(initialConvId)
  const [showModerationMenu, setShowModerationMenu] = useState(false)
  
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  
  const isReporter = currentUserId === reporterId

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load conversation details and messages
  useEffect(() => {
    const token = localStorage.getItem('kyurToken')
    if (!token) return

    async function loadChat() {
      try {
        let convIdToLoad = activeConvId;

        // If finder and no convId, initiate or get existing conversation
        if (!isReporter && !convIdToLoad) {
          const initRes = await axios.post(`${API_BASE_URL}/messages/conversations`, { itemId }, {
            headers: { Authorization: `Bearer ${token}` }
          })
          convIdToLoad = initRes.data.data._id
          setActiveConvId(convIdToLoad)
          setConversation(initRes.data.data)
        } else if (convIdToLoad) {
          const convsRes = await axios.get(`${API_BASE_URL}/messages/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const found = convsRes.data.data.find(c => c._id === convIdToLoad)
          if (found) setConversation(found)
        }

        if (!convIdToLoad) return

        const msgRes = await axios.get(`${API_BASE_URL}/messages/conversations/${convIdToLoad}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const loaded = msgRes.data.data.messages || []
        setMessages(loaded)
      } catch (err) {
        console.error('Failed to load chat:', err)
        setError('Failed to load chat.')
      }
    }

    loadChat()
    // socket intentionally omitted — mark-reads are handled in the socket effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, isReporter, currentUserId, activeConvId])

  // Socket Events — join room, attach listeners, and mark loaded messages as read
  useEffect(() => {
    if (!socket || !activeConvId) return

    const joinCurrentRoom = () => {
      socket.emit('join_room', { conversationId: activeConvId })
    }

    if (socket.connected) {
      joinCurrentRoom()
    }

    const handleConnect = () => {
      joinCurrentRoom()
    }

    const handleReceiveMessage = (message) => {
      console.log('Received message:', message)
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev
        return [...prev, message]
      })

      if (message.receiver?._id === currentUserId) {
        socket.emit('mark_read', { messageId: message._id, conversationId: activeConvId })
      }
    }

    const handleTyping = ({ userId }) => {
      if (userId !== currentUserId) setIsOtherTyping(true)
    }

    const handleStopTyping = ({ userId }) => {
      if (userId !== currentUserId) setIsOtherTyping(false)
    }

    const handleMessageRead = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, isRead: true } : msg))
      )
    }

    const handleSocketError = ({ message }) => {
      console.error('Socket error event:', message)
      setError(message)
    }

    socket.on('connect', handleConnect)
    socket.on('receive_message', handleReceiveMessage)
    socket.on('typing', handleTyping)
    socket.on('stop_typing', handleStopTyping)
    socket.on('message_read', handleMessageRead)
    socket.on('error', handleSocketError)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('receive_message', handleReceiveMessage)
      socket.off('typing', handleTyping)
      socket.off('stop_typing', handleStopTyping)
      socket.off('message_read', handleMessageRead)
      socket.off('error', handleSocketError)
    }
  }, [socket, activeConvId, currentUserId])

  // Mark already-loaded unread messages as read whenever messages or socket change
  useEffect(() => {
    if (!socket || !activeConvId || messages.length === 0) return
    messages.forEach((msg) => {
      if (msg.receiver?._id === currentUserId && !msg.isRead) {
        socket.emit('mark_read', { messageId: msg._id, conversationId: activeConvId })
      }
    })
  }, [messages, socket, currentUserId, activeConvId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOtherTyping])

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value)

    if (!socket || !activeConvId) return

    socket.emit('typing', { conversationId: activeConvId })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConvId })
    }, 2000)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (buttonDisabled) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      socket.emit('stop_typing', { conversationId: activeConvId })
    }

    socket.emit('send_message', {
      conversationId: activeConvId,
      itemId,
      content: newMessage.trim()
    })

    setNewMessage('')
  }

  const updateStatus = async (status) => {
    try {
      const token = localStorage.getItem('kyurToken')
      const res = await axios.put(`${API_BASE_URL}/messages/conversations/${activeConvId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setConversation(res.data.data)
    } catch (e) {
      console.error('Failed to update status', e)
      alert(e.response?.data?.message || 'Failed to update chat status')
    }
  }

  const moderateChat = async (action, value) => {
    try {
      const token = localStorage.getItem('kyurToken')
      const res = await axios.put(`${API_BASE_URL}/messages/conversations/${activeConvId}/moderate`, 
        { action, value },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setConversation(res.data.data)
      setShowModerationMenu(false)
    } catch (e) {
      console.error(`Failed to ${action} chat`, e)
      alert(e.response?.data?.message || `Failed to ${action} chat`)
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return ''
    return new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(isoString))
  }

  if (!activeConvId || !conversation) {
    return (
      <div className="chat-panel-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        {error
          ? <div className="alert alert-error chat-alert">{error}</div>
          : <p>Loading chat...</p>
        }
      </div>
    )
  }

  const otherUserName = isReporter ? conversation.finder?.name : conversation.reporter?.name
  const chatTitle = otherUserName ? `Chat with ${otherUserName}` : (isReporter ? 'Chat with Finder' : 'Chat with Reporter')
  
  const isPending = conversation.status === 'pending'
  const isCanceled = conversation.status === 'canceled'
  const isBlocked = conversation.blockedBy && conversation.blockedBy.length > 0
  const iBlocked = conversation.blockedBy && conversation.blockedBy.includes(currentUserId)
  const isMuted = conversation.mutedBy && conversation.mutedBy.includes(currentUserId)
  const isArchived = conversation.archivedBy && conversation.archivedBy.includes(currentUserId)
  
  // Calculate finder messages for pending state limit
  const finderMessageCount = messages.filter(m => m.sender?._id === currentUserId).length
  const finderReachedLimit = !isReporter && isPending && finderMessageCount >= 3

  const inputDisabled = !socket || (isReporter && isPending) || finderReachedLimit || isCanceled || isBlocked
  const buttonDisabled = inputDisabled || !newMessage.trim()

  let statusMessage = null
  let inputPlaceholder = 'Type your message here…'

  if (isBlocked) {
    statusMessage = "This conversation is blocked."
    inputPlaceholder = statusMessage
  } else if (isCanceled) {
    statusMessage = "This chat request was canceled."
    inputPlaceholder = statusMessage
  } else if (isPending) {
    if (isReporter) {
      statusMessage = "Accept this chat request to reply."
      inputPlaceholder = statusMessage
    } else {
      statusMessage = `You can send up to 3 messages before the reporter accepts your chat request. (${finderMessageCount}/3 sent)`
      if (finderReachedLimit) {
        inputPlaceholder = "Message limit reached. Waiting for reporter to accept."
      }
    }
  }

  return (
    <div className="chat-panel-container" style={{ position: 'relative' }}>
      <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>{chatTitle}</h3>
        <div style={{ position: 'relative' }}>
          <button 
            className="btn-secondary" 
            style={{ padding: '4px 8px', fontSize: '20px', lineHeight: 1 }}
            onClick={() => setShowModerationMenu(!showModerationMenu)}
          >
            ⋮
          </button>
          {showModerationMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              zIndex: 10,
              minWidth: '150px',
              padding: '8px 0',
              border: '1px solid #eee'
            }}>
              <button 
                style={{ width: '100%', padding: '8px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => moderateChat('mute', !isMuted)}
              >
                {isMuted ? 'Unmute Chat' : 'Mute Chat'}
              </button>
              <button 
                style={{ width: '100%', padding: '8px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => moderateChat('archive', !isArchived)}
              >
                {isArchived ? 'Unarchive Chat' : 'Archive Chat'}
              </button>
              <button 
                style={{ width: '100%', padding: '8px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                onClick={() => moderateChat('block', !iBlocked)}
              >
                {iBlocked ? 'Unblock Chat' : 'Block Chat'}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error chat-alert">{error}</div>}

      {statusMessage && (
        <div style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '12px 16px', fontSize: '14px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
          {statusMessage}
        </div>
      )}

      <div className="chat-messages-box">
        {isReporter && isPending && !isBlocked && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '16px 0' }}>
            <button className="btn-primary" onClick={() => updateStatus('accepted')}>Accept Chat</button>
            <button className="btn-secondary" style={{ color: '#ef4444' }} onClick={() => updateStatus('canceled')}>Cancel Request</button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" className="chat-bubble-icon">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>Send a message to start conversation and coordinate recovery.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender?._id === currentUserId
            return (
              <div key={msg._id} className={`chat-bubble-row ${isOwn ? 'own-bubble' : 'other-bubble'}`}>
                <div className="chat-bubble">
                  {!isOwn && <span className="chat-sender-name">{msg.sender?.name}</span>}
                  <p className="chat-message-text">{msg.content}</p>
                  <div className="chat-message-meta">
                    <span className="chat-message-time">{formatTime(msg.createdAt)}</span>
                    {isOwn && (
                      <span className={`chat-receipt-icon ${msg.isRead ? 'read' : 'sent'}`}>
                        {msg.isRead ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                            <path d="M18 6 7 17l-5-5M22 10l-7.5 7.5-2-2" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {isOtherTyping && (
          <div className="chat-bubble-row other-bubble typing-indicator-row">
            <div className="chat-bubble typing-bubble">
              <span className="typing-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={handleMessageChange}
          placeholder={inputPlaceholder}
          maxLength={500}
          disabled={inputDisabled}
        />
        <button type="submit" disabled={buttonDisabled}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  )
}
