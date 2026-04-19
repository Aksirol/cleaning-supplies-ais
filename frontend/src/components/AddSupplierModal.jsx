// frontend/src/components/AddSupplierModal.jsx
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const AddSupplierModal = ({ isOpen, onClose, onSupplierSaved, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '', edrpou: '', contact_person: '', phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || '',
        edrpou: initialData.edrpou || '',
        contact_person: initialData.contact_person || '',
        phone: initialData.phone || ''
      });
    } else if (isOpen) {
      setFormData({ name: '', edrpou: '', contact_person: '', phone: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const method = initialData ? 'PUT' : 'POST';
    const url = initialData ? `${API_URL}/suppliers/${initialData.id}` : `${API_URL}/suppliers`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Помилка збереження');
      }
      
      onSupplierSaved();
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{initialData ? 'Редагувати контрагента' : 'Новий контрагент'}</div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Назва *</label>
              <input type="text" required className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">ЄДРПОУ</label>
              <input type="text" className="form-control" value={formData.edrpou} onChange={e => setFormData({...formData, edrpou: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Контактна особа</label>
              <input type="text" className="form-control" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Телефон</label>
              <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Скасувати</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Зберегти</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplierModal;