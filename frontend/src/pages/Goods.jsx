import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import AddGoodModal from '../components/AddGoodModal';

const Goods = () => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Виносимо fetch в окрему функцію для повторного виклику
  const fetchGoods = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/goods')
      .then((res) => res.json())
      .then((data) => {
        setGoods(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGoods();
  }, []);

  // 2. Логіка видалення з підтвердженням
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити "${name}"?`)) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/goods/${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error); // Покажемо користувачу, якщо товар використовується
      } else {
        fetchGoods(); // Успішно видалено - оновлюємо таблицю
      }
    } catch (error) {
      alert('Сталася помилка при видаленні');
    }
  };

  return (
    <>
      <Topbar title="Товари" subtitle="Довідник миючих засобів" buttonText="+ Товар" onButtonClick={() => setIsModalOpen(true)} />
      <div className="content-area">
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Код</th><th>Назва</th><th>Категорія</th><th>Од. виміру</th><th>Ціна (грн)</th><th>Дія</th></tr>
            </thead>
            <tbody>
              {/* ... маппінг товарів ... */}
              {goods.map((item) => (
                  <tr key={item.id}>
                    <td className="text-id">{String(item.id).padStart(3, '0')}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.unit}</td>
                    <td>{item.price ? Number(item.price).toFixed(2) : '—'}</td>
                    <td>
                      {/* Змінили Дії */}
                      <span className="text-action" style={{ color: 'var(--danger)', marginLeft: '12px' }} onClick={() => handleDelete(item.id, item.name)}>
                        Видалити
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 3. Передаємо fetchGoods як колбек, щоб таблиця оновлювалась після додавання */}
      <AddGoodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onGoodAdded={fetchGoods} />
    </>
  );
};
export default Goods;