import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Keys',
  'Wallets & Cards',
  'Bags',
  'Clothing',
  'Jewelry',
  'Books',
  'Other',
];

const ReportItem = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'Lost',
    title: '',
    category: 'Electronics',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Active',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please provide title, description, and location');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Build FormData to support optional image upload
      const data = new FormData();
      data.append('type', formData.type);
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('description', formData.description.trim());
      data.append('location', formData.location.trim());
      data.append('date', formData.date);
      data.append('status', formData.status);

      if (imageFile) {
        data.append('image', imageFile);
      }

      await API.post('/items', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMsg(`Your ${formData.type.toLowerCase()} item has been reported successfully!`);

      setTimeout(() => {
        navigate('/my-reports');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to report item. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <div className="report-container">
        <div className="report-header">
          <span className="report-badge">📋 Submission Portal</span>
          <h1>Report an Item</h1>
          <p className="page-subtitle">
            Provide detailed information to increase the chances of item recovery and reunion.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="report-form card">
          {/* Type Toggle: Lost or Found */}
          <div className="form-group type-toggle-group">
            <label className="form-label-bold">What are you reporting?</label>
            <div className="type-toggle-buttons">
              <button
                type="button"
                className={`type-toggle-btn ${
                  formData.type === 'Lost' ? 'active lost' : ''
                }`}
                onClick={() => setFormData({ ...formData, type: 'Lost' })}
              >
                <span className="type-emoji">🚨</span>
                <div className="type-text">
                  <strong>I Lost an Item</strong>
                  <span>Looking for my lost possession</span>
                </div>
              </button>

              <button
                type="button"
                className={`type-toggle-btn ${
                  formData.type === 'Found' ? 'active found' : ''
                }`}
                onClick={() => setFormData({ ...formData, type: 'Found' })}
              >
                <span className="type-emoji">✨</span>
                <div className="type-text">
                  <strong>I Found an Item</strong>
                  <span>Safekeeping an item I recovered</span>
                </div>
              </button>
            </div>
          </div>

          <div className="form-row">
            {/* Title */}
            <div className="form-group flex-2">
              <label htmlFor="title">
                Item Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                placeholder="e.g. Black iPhone 15 with clear case, Brown Leather Wallet..."
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div className="form-group flex-1">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="form-control"
              placeholder="Describe distinguishing marks, brands, colors, contents, stickers, or unique scratches..."
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-row">
            {/* Location */}
            <div className="form-group flex-1">
              <label htmlFor="location">
                Location {formData.type === 'Lost' ? 'Lost' : 'Found'} <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon">📍</span>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-control"
                  placeholder="e.g. University Library 2nd floor, Main Cafeteria, Bus Stop..."
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="form-group flex-1">
              <label htmlFor="date">
                Date {formData.type === 'Lost' ? 'Lost' : 'Found'} <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Status */}
            <div className="form-group flex-1">
              <label htmlFor="status">Initial Status</label>
              <select
                id="status"
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Claimed">Claimed</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Optional Image Upload */}
          <div className="form-group">
            <label htmlFor="image">Optional Photo / Image</label>
            <div className="image-upload-zone">
              {imagePreview ? (
                <div className="image-preview-box">
                  <img src={imagePreview} alt="Item preview" className="preview-img" />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger remove-preview-btn"
                    onClick={handleRemoveImage}
                  >
                    ✕ Remove Image
                  </button>
                </div>
              ) : (
                <label className="upload-dropzone">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-file-input"
                  />
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">
                    Click to browse or drop an image here
                  </span>
                  <span className="upload-subtext">Supports PNG, JPG, WEBP (Max 5MB)</span>
                </label>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg submit-report-btn"
              disabled={loading}
            >
              {loading ? 'Submitting Report...' : `Submit ${formData.type} Report`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
