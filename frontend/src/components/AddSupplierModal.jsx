import { useState } from 'react';
import { API_URL } from '../config';

const AddSupplierModal = ({ isOpen, onClose, onSupplierAdded }) => {
  const [formData, setFormData] = useState({ name: '', edrpou: '', contact_person: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Помилка');
      
      onSupplierAdded(); // Оновлюємо таблицю
      setFormData({ name: '', edrpou: '', contact_person: '', phone: '' });
      onClose();
    } catch (error) {
      alert('Помилка збереження');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Новий контрагент</div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Назва (ТОВ, ПП, ФОП) *</label>
              <input type="text" required className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">ЄДРПОУ / ІПН</label>
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