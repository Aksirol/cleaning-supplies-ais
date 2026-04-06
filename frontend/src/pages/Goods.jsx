import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import AddGoodModal from '../components/AddGoodModal';

const Goods = () => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Стан для керування видимістю модального вікна
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/goods')
      .then((response) => response.json())
      .then((data) => {
        setGoods(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Помилка завантаження товарів:', error);
        setLoading(false);
      });
  }, []);

  // Ця функція викликається зсередини модалки, коли бекенд відповів успіхом
  const handleGoodAdded = (newGood) => {
    // Додаємо новий товар у кінець нашого масиву (таблиця оновиться миттєво)
    setGoods(prevGoods => [...prevGoods, newGood]);
  };

  return (
    <>
      {/* Кнопка тепер дійсно відкриває вікно */}
      <Topbar 
        title="Товари" 
        subtitle="Довідник миючих засобів" 
        buttonText="+ Товар" 
        onButtonClick={() => setIsModalOpen(true)} 
      />
      
      <div className="content-area">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Довідник товарів</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {loading ? 'Завантаження...' : `${goods.length} позицій`}
            </span>
          </div>
          
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Завантаження даних...</td>
                </tr>
              ) : (
                goods.map((item) => (
                  <tr key={item.id}>
                    <td className="text-id">{String(item.id).padStart(3, '0')}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.unit}</td>
                    <td>{item.price ? Number(item.price).toFixed(2) : '—'}</td>
                    <td><span className="text-action">Редаг.</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Підключаємо саму форму */}
      <AddGoodModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onGoodAdded={handleGoodAdded}
      />
    </>
  );
};

export default Goods;