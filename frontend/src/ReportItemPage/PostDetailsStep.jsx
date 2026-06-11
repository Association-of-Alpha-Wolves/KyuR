import { useState, useRef } from 'react'

export default function PostDetailsStep({ formData, setFormData, onNext, onCancel }) {
  const [titleCharCount, setTitleCharCount] = useState(formData.title.length)
  const [descCharCount, setDescCharCount] = useState(formData.description.length)
  const [imagePreview, setImagePreview] = useState(formData.imagePreviewUrl || null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleTitleChange = (e) => {
    const val = e.target.value
    if (val.length <= 100) {
      setFormData(prev => ({ ...prev, title: val }))
      setTitleCharCount(val.length)
    }
  }

  const handleDescChange = (e) => {
    const val = e.target.value
    if (val.length <= 1000) {
      setFormData(prev => ({ ...prev, description: val }))
      setDescCharCount(val.length)
    }
  }

  const handleCategoryChange = (e) => {
    setFormData(prev => ({ ...prev, category: e.target.value }))
  }

  const validateAndSetFile = (file) => {
    setError('')
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Invalid file format. Please upload JPEG, PNG, or WebP.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreviewUrl: reader.result
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    validateAndSetFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    validateAndSetFile(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const handleNextClick = () => {
    if (!formData.title.trim()) {
      setError('Post Title is required')
      return
    }
    if (!formData.category) {
      setError('Please select a category')
      return
    }
    if (!formData.description.trim()) {
      setError('Item Description is required')
      return
    }
    onNext()
  }

  return (
    <div className="report-step-panel">
      <h2>Post Details</h2>
      <p className="step-subtitle">
        Provide as much information as possible to help the owner identify their property
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="field-label" htmlFor="post-title">
          POST TITLE
        </label>
        <div className="input-with-counter">
          <input
            id="post-title"
            type="text"
            className="text-input"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Name the Found/Lost Item"
            required
          />
          <span className="char-counter">{titleCharCount}/100</span>
        </div>
      </div>

      <div className="form-group">
        <label className="field-label" htmlFor="post-category">
          CATEGORY
        </label>
        <select
          id="post-category"
          className="text-input select-input"
          value={formData.category}
          onChange={handleCategoryChange}
          required
        >
          <option value="">Select a Category</option>
          <option value="electronics">Electronics</option>
          <option value="wallet">Wallet</option>
          <option value="id">ID</option>
          <option value="accessories">Accessories</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="field-label" htmlFor="post-desc">
          ITEM DESCRIPTION
        </label>
        <div className="textarea-with-counter">
          <textarea
            id="post-desc"
            className="text-input textarea-input"
            value={formData.description}
            onChange={handleDescChange}
            placeholder="Describe the item: color, shape, markings..."
            rows={5}
            required
          />
          <span className="char-counter">{descCharCount}/1000</span>
        </div>
      </div>

      <div className="form-group">
        <label className="field-label">UPLOAD PHOTO</label>
        <div
          className={`upload-zone ${imagePreview ? 'has-preview' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp"
            style={{ display: 'none' }}
          />
          
          {imagePreview ? (
            <div className="upload-preview-container">
              <img src={imagePreview} alt="Upload Preview" className="upload-preview" />
              <div className="upload-preview-overlay">
                <span>Tap to Change Photo</span>
              </div>
            </div>
          ) : (
            <div className="upload-prompt">
              <svg className="upload-camera-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
              </svg>
              <strong>Tap to Capture or Upload</strong>
              <p>JPG, PNG, or WebP up to 5MB</p>
            </div>
          )}
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={handleNextClick}>
          Next Step
        </button>
      </div>
    </div>
  )
}
