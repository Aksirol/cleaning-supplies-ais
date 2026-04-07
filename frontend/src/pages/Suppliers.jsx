import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import AddSupplierModal from '../components/AddSupplierModal'; // Підключаємо модалку
import { API_URL } from '../config';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Стан для керування модальним вікном
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Виносимо fetch в окрему функцію, щоб викликати після додавання/видалення
  const fetchSuppliers = () => {
    setLoading(true);
    fetch(`${API_URL}/suppliers`)
      .then(res => res.json())
      .then(data => {
        setSuppliers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Помилка завантаження постачальників:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Логіка видалення
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити контрагента "${name}"?`)) return;
    
    try {
      const response = await fetch(`${API_URL}/suppliers/${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Сталася помилка'); 
      } else {
        fetchSuppliers(); // Успішно видалено - оновлюємо таблицю
      }
    } catch (error) {
      alert('Сталася помилка при видаленні');
    }
  };

  return (
    <>
      <Topbar 
        title="Постачальники" 
        subtitle="Контрагенти" 
        buttonText="+ Постачальник" 
        onButtonClick={() => setIsModalOpen(true)} // Тепер кнопка відкриває вікно
      />

      <div className="content-area">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Постачальники</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {loading ? 'Завантаження...' : `${suppliers.length} контрагенти`}
            </span>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Назва</th>
                <th>ЄДРПОУ</th>
                <th>Контакт</th>
                <th>Телефон</th>
                <th>Дія</th> {/* Нова колонка */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Завантаження даних...</td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Постачальників не знайдено</td>
                </tr>
              ) : (
                suppliers.map((item) => (
                  <tr key={item.id}>
                    <td className="text-id">П-{String(item.id).padStart(3, '0')}</td>
                    <td style={{ fontWeight: '500' }}>{item.name}</td>
                    <td>{item.edrpou || '—'}</td>
                    <td>{item.contact_person || '—'}</td>
                    <td>{item.phone || '—'}</td>
                    <td>
                      <span 
                        className="text-action" 
                        style={{ color: 'var(--danger)', cursor: 'pointer' }} 
                        onClick={() => handleDelete(item.id, item.name)}
                      >
                        Видалити
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Рендеримо модальне вікно */}
      <AddSupplierModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSupplierAdded={fetchSuppliers} 
      />
    </>
  );
};

export default Suppliers;