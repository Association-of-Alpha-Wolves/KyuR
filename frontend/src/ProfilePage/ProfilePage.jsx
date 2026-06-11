import './profile.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import DashboardOverview from './DashboardOverview'
import ReportedItemsList from './ReportedItemsList'
import ProfileSettings from './ProfileSettings'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const [currentUser, setCurrentUser] = useState({
    name: 'Juan Dela Cruz',
    email: 'jdelacruz@iskolarngbayan.pup.edu.ph',
    role: 'student'
  })
  
  const [userItems] = useState([
    {
      _id: 'item12345678',
      title: 'Blue Backpack',
      status: 'lost',
      createdAt: '2026-06-10T12:00:00.000Z',
      locationId: 'Main Library',
      imageUrl: ''
    },
    {
      _id: 'item87654321',
      title: 'IPhone 13 Pro',
      status: 'found',
      createdAt: '2026-06-09T08:30:00.000Z',
      locationId: 'Cafeteria',
      imageUrl: ''
    }
  ])

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
