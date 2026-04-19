import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import Topbar from '../components/Topbar';
import AddPurchaseModal from '../components/AddPurchaseModal';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Фільтри
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('Всі постачальники');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // СТАНИ ПАГІНАЦІЇ
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 50; // Кількість записів на сторінку

  useEffect(() => {
    fetch(`${API_URL}/suppliers`).then(res => res.json()).then(setSuppliersList);
  }, []);

  const fetchPurchases = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage,
      limit: limit
    });
    
    if (searchTerm) params.append('search', searchTerm);
    if (selectedSupplier !== 'Всі постачальники') params.append('supplier', selectedSupplier);
    if (selectedMonth) params.append('month', selectedMonth);

    fetch(`${API_URL}/purchases?${params.toString()}`)
      .then(res => res.json())
      .then(response => {
        // Тепер бекенд повертає { data, meta }
        setPurchases(response.data || []);
        if (response.meta) {
          setTotalPages(response.meta.totalPages);
          setTotalItems(response.meta.total);
        }
        setLoading(false);
      });
  };

  // Якщо змінилися фільтри — скидаємо сторінку на першу
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSupplier, selectedMonth]);

  // Завантажуємо дані при зміні фільтрів АБО сторінки
  useEffect(() => {
    const handler = setTimeout(fetchPurchases, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, selectedSupplier, selectedMonth, currentPage]);

  return (
    <>
      <Topbar title="Закупівлі" subtitle="Реєстр прибуткових накладних" buttonText="+ Нова закупівля" onButtonClick={() => setIsModalOpen(true)} />

      <div className="content-area">
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
              <tr><th>№ накладної</th><th>Дата</th><th>Постачальник</th><th>К-сть позицій</th><th>Сума</th><th>Статус</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{textAlign:'center'}}>Завантаження...</td></tr> : 
                purchases.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center'}}>Нічого не знайдено</td></tr> : 
                purchases.map(purchase => (
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
                Відображено {purchases.length} з {totalItems} записів
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