import { useState } from 'react';

const AddGoodModal = ({ isOpen, onClose, onGoodAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Порошки', // Значення за замовчуванням
    unit: 'шт.',
    min_stock: '',
    price: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Якщо вікно закрите, не рендеримо нічого
  if (!isOpen) return null;

  // Обробник зміни полів форми
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Відправка даних на сервер
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/goods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Помилка при збереженні');

      const newGood = await response.json();
      onGoodAdded(newGood); // Передаємо новий товар у батьківський компонент
      
      // Очищаємо форму після успішного збереження
      setFormData({ name: '', category: 'Порошки', unit: 'шт.', min_stock: '', price: '' });
      onClose(); // Закриваємо модалку
    } catch (error) {
      console.error(error);
      alert('Не вдалося додати товар');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Додати новий товар</div>
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
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoodModal;