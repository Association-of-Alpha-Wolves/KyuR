import { useState } from 'react'

const CAMPUS_LOCATIONS = [
  { id: 'QR-MAIN-S502', name: 'PUP Main Academic Building, South Wing 502' },
  { id: 'QR-MAIN-W405', name: 'PUP Main Academic Building, West Wing 405' },
  { id: 'QR-GYM-MAIN', name: 'PUP Gymnasium Main Floor' },
  { id: 'QR-LIB-MAIN', name: 'PUP Library Reading Room' },
  { id: 'QR-COURT-ENG', name: 'PUP Engineering Building Court' },
  { id: 'QR-CANT-MAIN', name: 'PUP Main Canteen Area' },
]

export default function LocationStep({ formData, setFormData, onNext, onBack }) {
  const [error, setError] = useState('')
  const [customLocation, setCustomLocation] = useState(
    CAMPUS_LOCATIONS.some(loc => loc.id === formData.locationId) ? '' : formData.locationId
  )

  const handleSelectLocation = (id) => {
    setFormData(prev => ({ ...prev, locationId: id }))
    setCustomLocation('')
  }

  const handleCustomLocationChange = (e) => {
    const val = e.target.value
    setCustomLocation(val)
    setFormData(prev => ({ ...prev, locationId: val }))
  }

  const handleNextClick = () => {
    if (!formData.locationId.trim()) {
      setError('Please select or specify a Location ID.')
      return
    }
    onNext()
  }

  return (
    <div className="report-step-panel">
      <h2>Location Details</h2>
      <p className="step-subtitle">
        Pinpoint where the item was lost or found on campus
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="field-label">SELECT CAMPUS LOCATION</label>
        <div className="predefined-locations-grid">
          {CAMPUS_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              type="button"
              className={`location-pill-btn ${formData.locationId === loc.id ? 'active' : ''}`}
              onClick={() => handleSelectLocation(loc.id)}
            >
              <svg className="location-pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="location-info">
                <span className="location-name">{loc.name}</span>
                <small className="location-qr-id">ID: {loc.id}</small>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="field-label" htmlFor="custom-location-id">
          OR SPECIFY CUSTOM LOCATION ID
        </label>
        <input
          id="custom-location-id"
          type="text"
          className="text-input"
          value={customLocation}
          onChange={handleCustomLocationChange}
          placeholder="e.g. QR-EAST-WING-101"
        />
        <small className="field-hint">
          Maps directly to the QR code placard installed at the physical location
        </small>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn-primary" onClick={handleNextClick}>
          Next Step
        </button>
      </div>
    </div>
  )
}
