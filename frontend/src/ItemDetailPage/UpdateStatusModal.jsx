import { useState } from 'react'

export default function UpdateStatusModal({ currentStatus, onSave, onClose, isSaving }) {
  const [status, setStatus] = useState(currentStatus)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(status)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Update Item Status</h3>
          <button className="btn-close-icon" onClick={onClose} aria-label="Close modal">
            {/* Lucide X Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-desc">
              Change the current status of this item. Marking as "Claimed" will close active messaging and attribute the claim to the finder.
            </p>

            <div className="status-selector-column">
              {['lost', 'found', 'claimed'].map((s) => (
                <label key={s} className={`status-option-label ${status === s ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="itemStatus"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    style={{ display: 'none' }}
                  />
                  <span className={`status-dot status-dot-${s}`} />
                  <span className="status-option-text">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
