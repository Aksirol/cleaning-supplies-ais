import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { API_URL } from '../config';

const Stock = () => {
  const navigate = useNavigate();
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Стани для фільтрів
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всі категорії');

  // Стан для сортування (за замовчуванням за залишкам від найбільшого до найменшого)
  const [sortConfig, setSortConfig] = useState({ key: 'quantity', direction: 'desc' });

  useEffect(() => {
    fetch(`${API_URL}/stock`)
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

  // Динамічно отримуємо унікальні категорії з товарів
  const categories = ['Всі категорії', ...new Set(stockItems.map(item => item.good?.category).filter(Boolean))];

  // 1. Спочатку фільтруємо дані
  const filteredStock = stockItems.filter(item => {
    // Додано безпечну перевірку наявності item.good
    if (!item.good) return false; 
    
    const matchesSearch = item.good.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Всі категорії' || item.good.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 2. Потім сортуємо ВЖЕ відфільтровані дані
  const sortedAndFilteredStock = useMemo(() => {
    let sortable = [...filteredStock];
    
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Обробка вкладених властивостей (назва, категорія, мін. запас лежать в об'єкті good)
        if (sortConfig.key === 'good_name') {
          aVal = a.good?.name || '';
          bVal = b.good?.name || '';
        }
        if (sortConfig.key === 'category') {
          aVal = a.good?.category || '';
          bVal = b.good?.category || '';
        }
        if (sortConfig.key === 'min_stock') {
          aVal = Number(a.good?.min_stock || 0);
          bVal = Number(b.good?.min_stock || 0);
        }
        
        // Числове сортування для кількості
        if (sortConfig.key === 'quantity') {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredStock, sortConfig]);

  // Функція зміни напрямку сортування
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

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
                <th onClick={() => requestSort('good_name')} style={{cursor:'pointer'}}>
                  Товар {sortConfig.key === 'good_name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('category')} style={{cursor:'pointer'}}>
                  Категорія {sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Од. виміру</th>
                <th onClick={() => requestSort('quantity')} style={{cursor:'pointer'}}>
                  Залишок {sortConfig.key === 'quantity' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => requestSort('min_stock')} style={{cursor:'pointer'}}>
                  Мін. запас {sortConfig.key === 'min_stock' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Завантаження даних...</td>
                </tr>
              ) : sortedAndFilteredStock.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Товарів не знайдено</td>
                </tr>
              ) : (
                sortedAndFilteredStock.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '500' }}>{item.good?.name}</td>
                    <td>{item.good?.category}</td>
                    <td>{item.good?.unit}</td>
                    <td style={{ fontWeight: '500' }}>{Number(item.quantity)}</td>
                    <td className="text-muted">{Number(item.good?.min_stock)}</td>
                    <td>{getStatusBadge(item.quantity, item.good?.min_stock)}</td>
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