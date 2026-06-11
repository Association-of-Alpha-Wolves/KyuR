import './profile.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import DashboardOverview from './DashboardOverview'
import ReportedItemsList from './ReportedItemsList'
import ProfileSettings from './ProfileSettings'
import { apiRequest } from '../services/api'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentUser, setCurrentUser] = useState(null)
  const [userItems, setUserItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await apiRequest('/api/auth/profile')
        const user = profileRes.data
        setCurrentUser(user)

        const itemsRes = await apiRequest(`/api/items/getItems?reportedBy=${user._id}&limit=100`)
        setUserItems(itemsRes.data.items)
      } catch (err) {
        setError(err.message || 'Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfileData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('kyurToken')
    navigate('/login')
  }

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(prev => ({
      ...prev,
      name: updatedUser.name
    }))
  }

  if (loading) {
    return (
      <div className="dashboard-shell-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading profile...</p>
      </div>
    )
  }

  if (error || !currentUser) {
    return (
      <div className="dashboard-shell-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#dc2626' }}>{error || 'Unable to load profile.'}</p>
      </div>
    )
  }

  return (
    <div className="dashboard-shell-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      {/* Main Workspace Content Area */}
      <main className="dashboard-main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab-view animate-fade-in">
            <header className="dashboard-content-header">
              <div>
                <h2>Student Dashboard</h2>
                <p className="header-subtitle">Manage your reports and check for status updates</p>
              </div>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => navigate('/items/report')}
              >
                {/* Lucide Plus Icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" style={{ marginRight: '6px' }}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Report Found Item
              </button>
            </header>

            {/* Overview Stats widgets */}
            <DashboardOverview items={userItems} setActiveTab={setActiveTab} />

            {/* Reported items list table */}
            <ReportedItemsList items={userItems} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="dashboard-tab-view animate-fade-in">
            <ProfileSettings user={currentUser} onProfileUpdate={handleProfileUpdate} />
          </div>
        )}
      </main>
    </div>
  )
}
