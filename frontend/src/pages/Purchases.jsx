import { useState, useEffect, useMemo } from 'react'; // Обов'язково додано useMemo
import { fetchWithAuth } from '../config';
import Topbar from '../components/Topbar';
import AddPurchaseModal from '../components/AddPurchaseModal';

const Purchases = () => {
  // 1. СТАН ДАНИХ ТА UI
  const [purchases, setPurchases] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. СТАНИ ФІЛЬТРІВ
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('Всі постачальники');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // 3. СТАНИ ПАГІНАЦІЇ
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 50; // Кількість записів на сторінку

  // 4. СТАН СОРТУВАННЯ
  const [sortConfig, setSortConfig] = useState({ key: 'doc_date', direction: 'desc' });

  // Завантажуємо список постачальників для фільтра
  useEffect(() => {
    fetchWithAuth(`/suppliers`)
      .then(res => res.json())
      .then(setSuppliersList)
      .catch(err => console.error('Помилка завантаження постачальників:', err));
  }, []);

  // Основна функція завантаження накладних
  const fetchPurchases = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage,
      limit: limit
    });
    
    if (searchTerm) params.append('search', searchTerm);
    if (selectedSupplier !== 'Всі постачальники') params.append('supplier', selectedSupplier);
    if (selectedMonth) params.append('month', selectedMonth);

    fetchWithAuth(`/purchases?${params.toString()}`)
      .then(res => res.json())
      .then(response => {
        setPurchases(response.data || []);
        if (response.meta) {
          setTotalPages(response.meta.totalPages);
          setTotalItems(response.meta.total);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Помилка завантаження закупівель:', err);
        setLoading(false);
      });
  };

  // Якщо змінилися фільтри — скидаємо сторінку на першу
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSupplier, selectedMonth]);

  // Завантажуємо дані при зміні фільтрів АБО сторінки (із затримкою Debounce)
  useEffect(() => {
    const handler = setTimeout(fetchPurchases, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, selectedSupplier, selectedMonth, currentPage]);

  // Логіка клієнтського сортування поточної сторінки
  const sortedPurchases = useMemo(() => {
    let sortable = [...purchases];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Обробка вкладених об'єктів
        if (sortConfig.key === 'supplier') {
          aVal = a.supplier?.name || '';
          bVal = b.supplier?.name || '';
        }
        // Перетворення на числа для правильного сортування сум
        if (sortConfig.key === 'total_sum') {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [purchases, sortConfig]);

  // Зміна напрямку сортування
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  return (
    <>
      <Topbar 
        title="Закупівлі" 
        subtitle="Реєстр прибуткових накладних" 
        buttonText="+ Нова закупівля" 
        onButtonClick={() => setIsModalOpen(true)} 
      />

      <div className="content-area">
        {/* ПАНЕЛЬ ФІЛЬТРІВ */}
        <div className="filter-bar">
          <input type="text" placeholder="Пошук по накладній..." style={{ width: '220px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
            <option value="Всі постачальники">Всі постачальники</option>
            {suppliersList.map(sup => <option key={sup.id} value={sup.name}>{sup.name}</option>)}
          </select>
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <span className="card-title">Реєстр закупівель</span>
          </div>
          
          <table className="table" style={{ marginBottom: 0 }}>
            <thead>
              <tr>
                <th onClick={() => requestSort('doc_number')} style={{cursor:'pointer'}}>№ накладної {sortConfig.key === 'doc_number' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => requestSort('doc_date')} style={{cursor:'pointer'}}>Дата {sortConfig.key === 'doc_date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => requestSort('supplier')} style={{cursor:'pointer'}}>Постачальник {sortConfig.key === 'supplier' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th>К-сть позицій</th>
                <th onClick={() => requestSort('total_sum')} style={{cursor:'pointer'}}>Сума {sortConfig.key === 'total_sum' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{textAlign:'center', padding: '20px'}}>Завантаження...</td></tr> : 
                sortedPurchases.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center', padding: '20px'}}>Нічого не знайдено</td></tr> : 
                sortedPurchases.map(purchase => ( /* ВИКОРИСТОВУЄМО sortedPurchases */
                  <tr key={purchase.id}>
                    <td className="text-id">{purchase.doc_number}</td>
                    <td>{new Date(purchase.doc_date).toLocaleDateString('uk-UA')}</td>
                    <td style={{fontWeight:'500'}}>{purchase.supplier.name}</td>
                    <td>{purchase.items?.length || 0}</td>
                    <td>{Number(purchase.total_sum).toLocaleString('uk-UA')} ₴</td>
                    <td><span className="badge badge-ok">Проведено</span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>

          {/* ПАНЕЛЬ ПАГІНАЦІЇ */}
          {!loading && totalItems > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Відображено {sortedPurchases.length} з {totalItems} записів
              </div>
              <div className="pagination-controls">
                <button 
                  className="btn-page" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Попередня
                </button>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  Сторінка {currentPage} з {totalPages || 1}
                </span>
                <button 
                  className="btn-page" 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Наступна
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddPurchaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPurchaseAdded={fetchPurchases} />
    </>
  );
};

export default Purchases;