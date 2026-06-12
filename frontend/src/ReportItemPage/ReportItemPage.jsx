import './report.css'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import PostDetailsStep from './PostDetailsStep'
import LocationStep from './LocationStep'
import ContactStep from './ContactStep'
import Brand from '../components/Brand'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'

function getStoredToken() {
  return localStorage.getItem('kyurToken')
}

export default function ReportItemPage() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    status: 'lost', // default status
    locationId: '',
    image: null,
    imagePreviewUrl: ''
  })

  const handleNextStep = () => {
    setActiveStep(prev => Math.min(prev + 1, 3))
  }

  const handleBackStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1))
  }

  const handleCancel = () => {
    navigate('/items')
  }

  const handleSubmitReport = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    const token = getStoredToken()
    if (!token) {
      setSubmitError('Authentication required. Please log in again.')
      setIsSubmitting(false)
      return
    }

    try {
      const data = new FormData()
      data.append('title', formData.title.trim())
      data.append('description', formData.description.trim())
      data.append('category', formData.category)
      data.append('status', formData.status)
      data.append('locationId', formData.locationId.trim())
      
      if (formData.image) {
        data.append('image', formData.image)
      }

      const response = await axios.post(`${API_BASE_URL}/items/createItem`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data?.success && response.data?.data?._id) {
        // Successfully created, redirect to item detail
        navigate(`/items/${response.data.data._id}`)
      } else {
        setSubmitError('Failed to create report. Invalid API response.')
      }
    } catch (err) {
      console.error('Submit report error:', err)
      const msg = err.response?.data?.message || 'An error occurred while creating the report. Please try again.'
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app-shell min-height-screen">
      {/* Navbar matching Screenshot 2 */}
      <header className="kyurNav" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <Link to="/" className="brandLink" style={{ flexShrink: 0, marginRight: 8 }}>
          <Brand />
        </Link>
        
        <nav className="navLinks" style={{ justifyContent: "flex-start", marginRight: "auto" }}>
          <Link to="/items">Hall of Lost and Found</Link>
        </nav>

        <button className="primary-action dashboard-back-btn" onClick={() => navigate('/profile')}>
          <svg className="back-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Dashboard
        </button>
      </header>

      {/* Stepper Header container */}
      <div className="custom-scroll-container">
        <div className="report-form-container">
          <div className="stepper-progress-bar">
            <div className="stepper-line">
              <div 
                className="stepper-line-fill" 
                style={{ width: `${((activeStep - 1) / 2) * 100}%` }}
              ></div>
            </div>
            
            <div className="stepper-steps">
              <div className={`step-node ${activeStep >= 1 ? 'completed' : ''} ${activeStep === 1 ? 'active' : ''}`}>
                <div className="step-circle">
                  {activeStep > 1 ? (
                    <svg className="step-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg className="step-inner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  )}
                </div>
                <span className="step-label">Information</span>
              </div>

              <div className={`step-node ${activeStep >= 2 ? 'completed' : ''} ${activeStep === 2 ? 'active' : ''}`}>
                <div className="step-circle">
                  {activeStep > 2 ? (
                    <svg className="step-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg className="step-inner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  )}
                </div>
                <span className="step-label">Location</span>
              </div>

              <div className={`step-node ${activeStep >= 3 ? 'completed' : ''} ${activeStep === 3 ? 'active' : ''}`}>
                <div className="step-circle">
                  <svg className="step-inner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <span className="step-label">Contact</span>
              </div>
            </div>
          </div>

          {/* Outer Form Card Layout */}
          <div className="report-form-card">
            {submitError && <div className="alert alert-error main-submit-error">{submitError}</div>}
            
            {activeStep === 1 && (
              <PostDetailsStep 
                formData={formData}
                setFormData={setFormData}
                onNext={handleNextStep}
                onCancel={handleCancel}
              />
            )}

            {activeStep === 2 && (
              <LocationStep 
                formData={formData}
                setFormData={setFormData}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}

            {activeStep === 3 && (
              <ContactStep 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmitReport}
                onBack={handleBackStep}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
