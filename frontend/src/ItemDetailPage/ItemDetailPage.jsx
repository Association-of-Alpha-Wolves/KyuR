import './detail.css'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import ItemInfoPanel from './ItemInfoPanel'
import ChatPanel from './ChatPanel'
import UpdateStatusModal from './UpdateStatusModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import Brand from '../components/Brand'
import { Search, LogOut } from 'lucide-react'
import NavChatDropdown from '../components/NavChatDropdown'
import { useSocket } from '../context/SocketContext'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'

function getStoredToken() {
  return localStorage.getItem('kyurToken')
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const queryParams = new URLSearchParams(location.search)
  const activeConversationId = queryParams.get('chat')

  const [item, setItem] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [draftSearch, setDraftSearch] = useState('')

  // Modal states
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Use the global socket context
  const socket = useSocket()

  // Fetch Item details and User Profile
  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setError('Authentication required. Please log in.')
      setIsLoading(false)
      return
    }

    async function loadPageData() {
      setIsLoading(true)
      setError('')
      try {
        const [itemResponse, profileResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/items/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        setItem(itemResponse.data.data)
        setCurrentUser(profileResponse.data.data)
      } catch (err) {
        console.error('Error fetching detail page data:', err)
        if (err.response?.status === 401) {
          navigate('/login')
          return
        }
        setError(err.response?.data?.message || 'Failed to load item details.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPageData()
  }, [id, navigate])

  // Update Status handler
  const handleSaveStatus = async (newStatus) => {
    setIsSavingStatus(true)
    const token = getStoredToken()
    try {
      const response = await axios.put(`${API_BASE_URL}/items/${id}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.success) {
        setItem(prev => ({
          ...prev,
          status: response.data.data.status,
          claimedBy: response.data.data.claimedBy
        }))
        setIsStatusModalOpen(false)
      }
    } catch (err) {
      console.error('Error updating item status:', err)
      alert(err.response?.data?.message || 'Failed to update status. Please try again.')
    } finally {
      setIsSavingStatus(false)
    }
  }

  // Delete Item handler
  const handleDeleteItem = async () => {
    setIsDeleting(true)
    const token = getStoredToken()
    try {
      const response = await axios.delete(`${API_BASE_URL}/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.success) {
        navigate('/items')
      }
    } catch (err) {
      console.error('Error deleting item:', err)
      alert(err.response?.data?.message || 'Failed to delete item. Please try again.')
      setIsDeleting(false)
    }
  }

  const submitSearch = (event) => {
    event.preventDefault()
    if (draftSearch.trim()) {
      navigate(`/items?search=${encodeURIComponent(draftSearch.trim())}`)
    } else {
      navigate(`/items`)
    }
  }

  const isReporter = currentUser && item && item.reportedBy?._id === currentUser._id

  if (isLoading) {
    return (
      <div className="detail-loading-screen">
        <div className="spinner-icon big-spinner"></div>
        <span>Loading item details...</span>
      </div>
    )
  }

  if (error || !item || !currentUser) {
    return (
      <main className="app-shell min-height-screen">
        <header className="kyurNav" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <Link to="/" className="brandLink" style={{ flexShrink: 0, marginRight: 8 }}>
            <Brand />
          </Link>
          
          <nav className="navLinks" style={{ justifyContent: "flex-start", marginRight: "auto" }}>
            <Link to="/items">Hall of Lost and Found</Link>
            <Link to="/profile">Management</Link>
            <Link to="/about">About</Link>
          </nav>

          <form className="navSearch" onSubmit={submitSearch}>
            <button type="submit" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}>
              <Search size={16} />
            </button>
            <input
              type="search"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              placeholder="Search for an item"
            />
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link className="reportBtn" to="/items/report">
              Report Lost Item
            </Link>
          <NavChatDropdown />
            <button 
              onClick={() => { localStorage.removeItem('kyurToken'); window.location.href='/login'; }} 
              className="btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', minWidth: '40px', minHeight: '40px' }}
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>
        <div className="custom-scroll-container">
          <div className="error-panel">
            {/* Lucide AlertOctagon Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48" className="error-oct-icon">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2>An Error Occurred</h2>
            <p>{error || 'Item could not be found or loaded.'}</p>
            <Link to="/items" className="btn-primary">
              Back to Catalog
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="app-shell min-height-screen">
      {/* Dynamic Header */}
      <header className="kyurNav" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <Link to="/" className="brandLink" style={{ flexShrink: 0, marginRight: 8 }}>
          <Brand />
        </Link>
        
        <nav className="navLinks" style={{ justifyContent: "flex-start", marginRight: "auto" }}>
          <Link to="/items">Hall of Lost and Found</Link>
          <Link to="/profile">Management</Link>
          <Link to="/about">About</Link>
        </nav>

        {/* Global Search Bar */}
        <form className="navSearch" onSubmit={submitSearch}>
          <button type="submit" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </button>
          <input
            type="search"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            placeholder="Search for an item"
          />
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link className="reportBtn" to="/items/report">
            Report Lost Item
          </Link>
          <NavChatDropdown />
          <button 
            onClick={() => { localStorage.removeItem('kyurToken'); window.location.href='/login'; }} 
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', minWidth: '40px', minHeight: '40px' }}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Two-Panel Layout */}
      <div className="custom-scroll-container">
        <div className="item-detail-layout-container">
          <div className="item-detail-grid">
            <section className="left-info-panel">
              <ItemInfoPanel
                item={item}
                isReporter={isReporter}
                onOpenStatusModal={() => setIsStatusModalOpen(true)}
                onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
              />
            </section>

            <section className="right-chat-panel">
              {isReporter && !activeConversationId ? (
                <div className="chat-panel-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: '#666' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ marginBottom: 16, opacity: 0.5 }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p>Select a chat from the navigation menu to view messages.</p>
                </div>
              ) : (
                <ChatPanel
                  itemId={id}
                  conversationId={activeConversationId}
                  currentUserId={currentUser._id}
                  reporterId={item.reportedBy?._id}
                  socket={socket}
                />
              )}
            </section>
          </div>
        </div>

        {/* Modal overlays */}
        {isStatusModalOpen && (
          <UpdateStatusModal
            currentStatus={item.status}
            onSave={handleSaveStatus}
            onClose={() => setIsStatusModalOpen(false)}
            isSaving={isSavingStatus}
          />
        )}

        {isDeleteModalOpen && (
          <DeleteConfirmModal
            title={item.title}
            onDelete={handleDeleteItem}
            onClose={() => setIsDeleteModalOpen(false)}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </main>
  )
}
