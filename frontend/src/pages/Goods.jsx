import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import Topbar from '../components/Topbar';
import AddGoodModal from '../components/AddGoodModal';

const Goods = () => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGood, setSelectedGood] = useState(null);

  const fetchGoods = () => {
    setLoading(true);
    fetch(`${API_URL}/goods`)
      .then((res) => res.json())
      .then((data) => {
        setGoods(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Помилка завантаження товарів:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGoods();
  }, []);

  // Логіка видалення
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити "${name}"?`)) return;
    
    try {
      const response = await fetch(`${API_URL}/goods/${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Помилка видалення');
      } else {
        fetchGoods();
      }
    } catch (error) {
      alert('Сталася помилка при видаленні');
    }
  };

  // Логіка редагування
  const handleEdit = (good) => {
    setSelectedGood(good);
    setIsModalOpen(true);
  };

  // Логіка додавання нового
  const handleAddNew = () => {
    setSelectedGood(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <Topbar 
        title="Товари" 
        subtitle="Довідник миючих засобів" 
        buttonText="+ Товар" 
        onButtonClick={handleAddNew} 
      />
      
      <div className="content-area">
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Назва</th>
                <th>Категорія</th>
                <th>Од. виміру</th>
                <th>Ціна (грн)</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Завантаження...</td>
                </tr>
              ) : goods.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Товарів не знайдено</td>
                </tr>
              ) : (
                goods.map((item) => (
                  <tr key={item.id}>
                    <td className="text-id">{String(item.id).padStart(3, '0')}</td>
                    <td style={{ fontWeight: '500' }}>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.unit}</td>
                    <td>{item.price ? Number(item.price).toFixed(2) : '—'}</td>
                    <td>
                      <span 
                        className="text-action" 
                        onClick={() => handleEdit(item)}
                      >
                        Редагувати
                      </span>
                      <span 
                        className="text-action" 
                        style={{ color: 'var(--danger)', marginLeft: '12px' }} 
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
      
      {/* Модальне вікно для створення та редагування */}
      <AddGoodModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onGoodSaved={fetchGoods}
        initialData={selectedGood} 
      />
    </>
  );
};

export default Goods;