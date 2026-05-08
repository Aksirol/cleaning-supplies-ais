import { useState } from 'react';
import { fetchWithAuth } from '../config';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'MANAGER'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onUserAdded();
        onClose();
        setFormData({ username: '', password: '', full_name: '', role: 'MANAGER' });
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert('Помилка мережі');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Новий користувач</div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">ПІБ (Повне ім'я)</label>
              <input type="text" className="form-control" required value={formData.full_name} 
                onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Логін</label>
              <input type="text" className="form-control" required value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input type="password" title="Мінімум 6 символів" className="form-control" required 
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Роль</label>
              <select className="form-control" value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="MANAGER">MANAGER (Склад та звіти)</option>
                <option value="ADMIN">ADMIN (Повний доступ)</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Скасувати</button>
            <button type="submit" className="btn btn-primary">Створити</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;