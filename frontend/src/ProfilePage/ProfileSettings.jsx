import { useState } from 'react'

export default function ProfileSettings({ user, onProfileUpdate }) {
  const [name, setName] = useState(user.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const getInitials = (nameStr) => {
    if (!nameStr) return 'U'
    return nameStr.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (newPassword && newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.')
      return
    }

    setIsLoading(true)

    // Mock API Delay
    setTimeout(() => {
      setIsLoading(false)
      setSuccessMsg('Profile updated successfully! (Mocked)')
      onProfileUpdate({ name: name.trim() })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }, 1000)
  }

  return (
    <div className="profile-settings-container">
      <h2>Account Settings</h2>
      <p className="section-subtitle">Manage your profile details and security options</p>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="profile-settings-form">
        <div className="avatar-profile-row">
          <div className="avatar-initials-big" aria-label="Initials Avatar">
            {getInitials(user.name)}
          </div>
          <div className="avatar-info-col">
            <span className="profile-role-badge">
              {user.role ? user.role.toUpperCase() : 'STUDENT'}
            </span>
            <span className="profile-email-lbl">{user.email}</span>
          </div>
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="profile-name">
            Display Name
          </label>
          <input
            id="profile-name"
            type="text"
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your full name"
          />
        </div>

        <div className="form-group">
          <label className="field-label" htmlFor="profile-email">
            Email Address (Read-Only)
          </label>
          <input
            id="profile-email"
            type="email"
            className="text-input text-input-readonly"
            value={user.email || ''}
            readOnly
          />
        </div>

        <hr className="divider-line" />

        <h3 className="security-form-title">Security & Password</h3>
        <p className="field-hint">Leave blank if you do not want to change your password.</p>

        <div className="form-group">
          <label className="field-label" htmlFor="current-pw">
            Current Password
          </label>
          <input
            id="current-pw"
            type="password"
            className="text-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="form-group grid-2-col">
          <div>
            <label className="field-label" htmlFor="new-pw">
              New Password
            </label>
            <input
              id="new-pw"
              type="password"
              className="text-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="confirm-new-pw">
              Confirm New Password
            </label>
            <input
              id="confirm-new-pw"
              type="password"
              className="text-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
