import { useState } from 'react'

export default function ContactStep({ formData, setFormData, onSubmit, onBack, isSubmitting }) {
  const [error, setError] = useState('')

  const handleStatusChange = (status) => {
    setFormData(prev => ({ ...prev, status }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.status) {
      setError('Please select whether the item is Lost or Found.')
      return
    }

    onSubmit()
  }

  return (
    <div className="report-step-panel">
      <h2>Report Confirmation</h2>
      <p className="step-subtitle">
        Review your lost-and-found report before submitting it to the campus registry
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="field-label">REPORT STATUS</label>
        <div className="status-selector-row" role="group" aria-label="Item Status">
          <button
            type="button"
            className={`status-btn lost-btn ${formData.status === 'lost' ? 'active' : ''}`}
            onClick={() => handleStatusChange('lost')}
          >
            <span className="status-dot"></span>
            Lost Item
          </button>
          <button
            type="button"
            className={`status-btn found-btn ${formData.status === 'found' ? 'active' : ''}`}
            onClick={() => handleStatusChange('found')}
          >
            <span className="status-dot"></span>
            Found Item
          </button>
        </div>
      </div>

      <div className="report-summary-card">
        <h3>Report Summary</h3>
        <dl className="summary-list">
          <div className="summary-row">
            <dt>Title</dt>
            <dd>{formData.title}</dd>
          </div>
          <div className="summary-row">
            <dt>Category</dt>
            <dd className="category-capitalize">{formData.category}</dd>
          </div>
          <div className="summary-row">
            <dt>Location ID</dt>
            <dd>{formData.locationId}</dd>
          </div>
          <div className="summary-row">
            <dt>Description</dt>
            <dd className="summary-desc-text">{formData.description}</dd>
          </div>
          {formData.imagePreviewUrl && (
            <div className="summary-row summary-image-row">
              <dt>Attached Photo</dt>
              <dd>
                <img src={formData.imagePreviewUrl} alt="Attached Preview" className="summary-thumbnail" />
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack} disabled={isSubmitting}>
          Back
        </button>
        <button
          type="button"
          className="btn-primary btn-submit-report"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="loading-spinner-btn">
              <span className="spinner-icon"></span>
              Submitting...
            </div>
          ) : (
            'Submit Report'
          )}
        </button>
      </div>
    </div>
  )
}
