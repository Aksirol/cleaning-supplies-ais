import { useState, useEffect, useMemo } from 'react';
import { fetchWithAuth } from '../config'
import Topbar from '../components/Topbar';
import AddGoodModal from '../components/AddGoodModal';

const Goods = () => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGood, setSelectedGood] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  const fetchGoods = () => {
    setLoading(true);
    fetchWithAuth('/goods') // API_URL вже підставляється всередині!
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
      const response = await fetchWithAuth(`/goods/${id}`, { method: 'DELETE' });
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

  const sortedGoods = useMemo(() => {
    let sortable = [...goods];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Перетворення на числа для коректного сортування ціни та ID
        if (sortConfig.key === 'price' || sortConfig.key === 'id') {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [goods, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
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
                <th onClick={() => requestSort('id')} style={{cursor:'pointer'}}>Код {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => requestSort('name')} style={{cursor:'pointer'}}>Назва {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => requestSort('category')} style={{cursor:'pointer'}}>Категорія {sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Од. виміру</th>
                <th onClick={() => requestSort('price')} style={{cursor:'pointer'}}>Ціна (грн) {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Завантаження...</td></tr>
              ) : sortedGoods.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Товарів не знайдено</td></tr>
              ) : (
                sortedGoods.map((item) => (
                  <tr key={item.id}>
                    <td className="text-id">{String(item.id).padStart(3, '0')}</td>
                    <td style={{ fontWeight: '500' }}>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.unit}</td>
                    <td>{item.price ? Number(item.price).toFixed(2) : '—'}</td>
                    <td>
                      <span className="text-action" onClick={() => handleEdit(item)}>Редагувати</span>
                      <span className="text-action" style={{ color: 'var(--danger)', marginLeft: '12px' }} onClick={() => handleDelete(item.id, item.name)}>Видалити</span>
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