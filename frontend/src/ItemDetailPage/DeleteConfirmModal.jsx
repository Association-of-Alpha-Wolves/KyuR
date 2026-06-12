export default function DeleteConfirmModal({ title, onDelete, onClose, isDeleting }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-card-danger">
        <div className="modal-header">
          <h3 className="danger-text">Delete Item Report</h3>
          <button className="btn-close-icon" onClick={onClose} aria-label="Close modal">
            {/* Lucide X Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="danger-icon-container">
            {/* Lucide AlertTriangle Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40" className="alert-triangle-icon">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p className="modal-desc delete-warning-text">
            Are you sure you want to delete the report <strong>"{title}"</strong>? This action is permanent, will erase all message history, and cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  )
}
