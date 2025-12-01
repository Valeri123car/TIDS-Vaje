import React, { useState } from 'react';
import { X, Mountain, Calendar, Clock, Star, FileText } from 'lucide-react';
import './addHikeModal.css';

const AddHikeModal = ({ trails, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    trailId: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    notes: '',
    rating: 5
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.trailId) {
      setError('Prosimo izberite pot');
      return;
    }
    
    if (!formData.duration || formData.duration <= 0) {
      setError('Prosimo vnesite trajanje pohoda');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAdd({
        trailId: parseInt(formData.trailId),
        date: formData.date,
        duration: parseInt(formData.duration),
        notes: formData.notes,
        rating: parseInt(formData.rating)
      });
    } catch (err) {
      setError('Napaka pri dodajanju pohoda');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectedTrail = trails.find(t => t.id === parseInt(formData.trailId));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-hike-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <Mountain size={36} />
          <h2>Dodaj Opravljen Pohod</h2>
          <p>Zabeleži svoj pohod in zberi žetone!</p>
        </div>

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-hike-form">
          {/* Trail Selection */}
          <div className="form-group">
            <label htmlFor="trailId">
              <Mountain size={20} />
              <span>Izberi pot *</span>
            </label>
            <select
              id="trailId"
              name="trailId"
              value={formData.trailId}
              onChange={handleChange}
              required
            >
              <option value="">-- Izberi pot --</option>
              {trails.map(trail => (
                <option key={trail.id} value={trail.id}>
                  {trail.izhod_info || `Pot ${trail.id}`}
                  {trail.cilj_info ? ` → ${trail.cilj_info}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Trail Info Preview */}
          {selectedTrail && (
            <div className="trail-preview">
              <div className="trail-preview-item">
                <span className="label">Razdalja:</span>
                <span className="value">{selectedTrail.Razdalja || '-'}</span>
              </div>
              <div className="trail-preview-item">
                <span className="label">Vzpon:</span>
                <span className="value">{selectedTrail.Vzpon || '-'}</span>
              </div>
              <div className="trail-preview-item">
                <span className="label">Zahtevnost:</span>
                <span className="value">{selectedTrail.Zahtevnost || '-'}</span>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="form-group">
            <label htmlFor="date">
              <Calendar size={20} />
              <span>Datum pohoda *</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Duration */}
          <div className="form-group">
            <label htmlFor="duration">
              <Clock size={20} />
              <span>Trajanje (minute) *</span>
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              placeholder="npr. 180 (3 ure)"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              required
            />
            {formData.duration > 0 && (
              <span className="duration-helper">
                ≈ {Math.floor(formData.duration / 60)}h {formData.duration % 60}min
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="form-group">
            <label htmlFor="rating">
              <Star size={20} />
              <span>Ocena izkušnje</span>
            </label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                >
                  <Star size={32} fill={formData.rating >= star ? '#f39c12' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">
              <FileText size={20} />
              <span>Opombe (opcijsko)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Kakšna je bila vaša izkušnja? Vreme? Kaj posebnega ste videli?"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {/* Submit */}
          <button type="submit" className="submit-hike-btn" disabled={loading}>
            {loading ? 'Dodajam...' : 'Dodaj pohod'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHikeModal;