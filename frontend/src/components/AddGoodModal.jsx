// frontend/src/components/AddGoodModal.jsx
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const AddGoodModal = ({ isOpen, onClose, onGoodSaved, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Порошки',
    unit: 'шт.',
    min_stock: 0,
    price: 0
  });

  // Коли відкриваємо модалку для редагування, заповнюємо поля
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        unit: initialData.unit,
        min_stock: Number(initialData.min_stock),
        price: Number(initialData.price || 0)
      });
    } else {
      // Скидання форми для створення нового
      setFormData({ name: '', category: 'Порошки', unit: 'шт.', min_stock: 0, price: 0 });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = initialData ? 'PUT' : 'POST';
    const url = initialData ? `${API_URL}/goods/${initialData.id}` : `${API_URL}/goods`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        onGoodSaved();
        onClose();
      }
    } catch (error) {
      alert('Помилка збереження');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{initialData ? 'Редагувати товар' : 'Додати товар'}</div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Назва товару *</label>
              <input type="text" name="name" required className="form-control" placeholder="Наприклад: Мило рідке 5л" value={formData.name} onChange={handleChange} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Категорія</label>
                <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                  <option value="Порошки">Порошки</option>
                  <option value="Рідкі засоби">Рідкі засоби</option>
                  <option value="Мило">Мило</option>
                  <option value="Дезінфектанти">Дезінфектанти</option>
                  <option value="Інвентар">Інвентар</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Одиниця виміру</label>
                <select name="unit" className="form-control" value={formData.unit} onChange={handleChange}>
                  <option value="шт.">шт.</option>
                  <option value="уп.">уп.</option>
                  <option value="л">л</option>
                  <option value="каністра">каністра</option>
                  <option value="кг">кг</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Мін. залишок *</label>
                <input type="number" name="min_stock" required min="0" step="0.01" className="form-control" value={formData.min_stock} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Облікова ціна (грн)</label>
                <input type="number" name="price" min="0" step="0.01" className="form-control" value={formData.price} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Скасувати</button>
            <button type="submit" className="btn btn-primary">Зберегти</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoodModal;