import { useState, useEffect } from 'react';
import AddPurchaseModal from '../components/AddPurchaseModal';
import Topbar from '../components/Topbar';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Виносимо fetch в окрему функцію, щоб зручно оновлювати таблицю
  const fetchPurchases = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/purchases')
      .then(res => res.json())
      .then(data => {
        setPurchases(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Помилка завантаження закупівель:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // Стани для фільтрів
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('Всі постачальники');
  // За замовчуванням беремо поточний місяць у форматі YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetch('http://localhost:5000/api/purchases')
      .then(res => res.json())
      .then(data => {
        setPurchases(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Помилка завантаження закупівель:', err);
        setLoading(false);
      });
  }, []);

  // Отримуємо унікальних постачальників для випадаючого списку фільтра
  const suppliers = ['Всі постачальники', ...new Set(purchases.map(p => p.supplier.name))];

  // Логіка фільтрації
  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.doc_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = selectedSupplier === 'Всі постачальники' || p.supplier.name === selectedSupplier;
    const matchesMonth = selectedMonth ? p.doc_date.startsWith(selectedMonth) : true;
    
    return matchesSearch && matchesSupplier && matchesMonth;
  });

  return (
    <>
      <Topbar 
        title="Закупівлі" 
        subtitle="Реєстр прибуткових накладних" 
        buttonText="+ Нова закупівля" 
        onButtonClick={() => setIsModalOpen(true)} 
      />

      <div className="content-area">
        
        {/* Панель фільтрів */}
        <div className="filter-bar">
          <input 
            type="text" 
            placeholder="Пошук по накладній..." 
            style={{ width: '220px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={selectedSupplier} 
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            {suppliers.map((sup, index) => (
              <option key={index} value={sup}>{sup}</option>
            ))}
          </select>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>

        {/* Таблиця реєстру */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Реєстр закупівель</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {loading ? 'Завантаження...' : `${filteredPurchases.length} записів`}
            </span>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>№ накладної</th>
                <th>Дата</th>
                <th>Постачальник</th>
                <th>К-сть позицій</th>
                <th>Сума</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Завантаження даних...</td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Накладних не знайдено</td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="text-id">{purchase.doc_number}</td>
                    <td>{new Date(purchase.doc_date).toLocaleDateString('uk-UA')}</td>
                    <td style={{ fontWeight: '500' }}>{purchase.supplier.name}</td>
                    <td>{purchase.items?.length || 0}</td>
                    <td>{Number(purchase.total_sum).toLocaleString('uk-UA')} ₴</td>
                    <td>
                      <span className={`badge ${purchase.status === 'Проведено' ? 'badge-ok' : 'badge-warn'}`}>
                        {purchase.status || 'Створено'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
      {/* Підключаємо форму */}
      <AddPurchaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPurchaseAdded={fetchPurchases} 
      />
    </>
  );
};

export default Purchases;