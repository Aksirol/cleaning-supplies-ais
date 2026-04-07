import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';

const Stock = () => {
  const navigate = useNavigate();
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Стани для фільтрів
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всі категорії');

  useEffect(() => {
    fetch('http://localhost:5000/api/stock')
      .then(res => res.json())
      .then(data => {
        setStockItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Помилка завантаження складу:', err);
        setLoading(false);
      });
  }, []);

  // Динамічно отримуємо унікальні категорії з товарів для випадаючого списку
  const categories = ['Всі категорії', ...new Set(stockItems.map(item => item.good.category))];

  // Застосовуємо фільтри до даних
  const filteredStock = stockItems.filter(item => {
    const matchesSearch = item.good.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Всі категорії' || item.good.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Функція для визначення кольорової мітки статусу
  const getStatusBadge = (quantity, minStock) => {
    const qty = Number(quantity);
    const min = Number(minStock);

    if (qty === 0 || qty <= min / 2) {
      return <span className="badge badge-danger">Критично</span>;
    }
    if (qty <= min) {
      return <span className="badge badge-warn">Мало</span>;
    }
    return <span className="badge badge-ok">Норма</span>;
  };

  // Поточна дата для заголовка таблиці
  const currentDate = new Date().toLocaleDateString('uk-UA');

  return (
    <>
      <Topbar 
        title="Склад" 
        subtitle="Залишки товарів" 
        buttonText="+ Прихід" 
        onButtonClick={() => navigate('/purchases')} 
      />

      <div className="content-area">
        
        {/* Панель фільтрів */}
        <div className="filter-bar">
          <input 
            type="text" 
            placeholder="Пошук за назвою..." 
            style={{ width: '250px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Таблиця залишків */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Залишки на складі</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Станом на {currentDate}
            </span>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Категорія</th>
                <th>Од. виміру</th>
                <th>Залишок</th>
                <th>Мін. запас</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Завантаження даних...</td>
                </tr>
              ) : filteredStock.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Товарів не знайдено</td>
                </tr>
              ) : (
                filteredStock.map((item) => (
                  <tr key={item.id}>
                    <td>{item.good.name}</td>
                    <td>{item.good.category}</td>
                    <td>{item.good.unit}</td>
                    <td style={{ fontWeight: '500' }}>{Number(item.quantity)}</td>
                    <td className="text-muted">{Number(item.good.min_stock)}</td>
                    <td>{getStatusBadge(item.quantity, item.good.min_stock)}</td>
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

export default Stock;