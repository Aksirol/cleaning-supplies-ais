import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Завантажуємо постачальників з бекенду при відкритті сторінки
  useEffect(() => {
    fetch('http://localhost:5000/api/suppliers')
      .then(res => res.json())
      .then(data => {
        setSuppliers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Помилка завантаження постачальників:', err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Topbar 
        title="Постачальники" 
        subtitle="Контрагенти" 
        buttonText="+ Постачальник" 
        onButtonClick={() => alert('Тут буде модальне вікно для додавання постачальника')} 
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Завантаження даних...</td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Постачальників не знайдено</td>
                </tr>
              ) : (
                suppliers.map((item) => (
                  <tr key={item.id}>
                    {/* Форматуємо ID, наприклад "П-001" */}
                    <td className="text-id">П-{String(item.id).padStart(3, '0')}</td>
                    <td style={{ fontWeight: '500' }}>{item.name}</td>
                    <td>{item.edrpou || '—'}</td>
                    <td>{item.contact_person || '—'}</td>
                    <td>{item.phone || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Suppliers;