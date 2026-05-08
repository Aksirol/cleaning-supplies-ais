import { useState, useEffect, useMemo } from 'react';
import { fetchWithAuth } from '../config';
import Topbar from '../components/Topbar';
import AddExpenseModal from '../components/AddExpenseModal';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Фільтри
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('Всі підрозділи');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Сортування
  const [sortConfig, setSortConfig] = useState({ key: 'doc_date', direction: 'desc' });

  const fetchFiltersData = () => {
    fetchWithAuth('/departments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDepartments(data);
      })
      .catch(err => console.error(err));
  };

  const fetchExpenses = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedDept !== 'Всі підрозділи') params.append('department', selectedDept);
    
    // Перевіряємо, чи selectedMonth не порожній (на випадок очищення поля)
    if (selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)) {
      params.append('month', selectedMonth);
    }

    fetchWithAuth(`/expenses?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        // БЕЗПЕЧНЕ ВСТАНОВЛЕННЯ ДАНИХ
        if (Array.isArray(data)) {
          setExpenses(data); // Звичайна відповідь
        } else if (data && Array.isArray(data.data)) {
          setExpenses(data.data); // Якщо є пагінація
        } else {
          setExpenses([]); // Якщо прийшла помилка { error: '...' }
          if (data?.error) console.error("Помилка від бекенду:", data.error);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Мережева помилка:", err);
        setExpenses([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  // Серверна фільтрація з Debounce
  useEffect(() => {
    const handler = setTimeout(() => fetchExpenses(), 300);
    return () => clearTimeout(handler);
  }, [searchTerm, selectedDept, selectedMonth]);

  // Логіка сортування на клієнті
  const sortedExpenses = useMemo(() => {
    // ЗАХИСТ: якщо expenses чомусь не масив, повертаємо порожній масив
    if (!Array.isArray(expenses)) return [];

    let sortableItems = [...expenses];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'department') {
          aVal = a.department?.name || '';
          bVal = b.department?.name || '';
        }

        // Числові поля — конвертуємо явно
        if (sortConfig.key === 'total_sum') {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        }

        // Дати — конвертуємо в timestamp
        if (sortConfig.key === 'doc_date') {
          aVal = new Date(aVal || 0).getTime();
          bVal = new Date(bVal || 0).getTime();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [expenses, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  return (
    <>
      <Topbar title="Витрати" subtitle="Акти списання" buttonText="+ Новий акт" onButtonClick={() => setIsModalOpen(true)} />
      
      <div className="content-area">
        <div className="filter-bar">
          <input type="text" placeholder="Пошук за номером..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
            <option>Всі підрозділи</option>
            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th onClick={() => requestSort('doc_number')} style={{cursor:'pointer'}}>№ акту {sortConfig.key === 'doc_number' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => requestSort('doc_date')} style={{cursor:'pointer'}}>Дата {sortConfig.key === 'doc_date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => requestSort('department')} style={{cursor:'pointer'}}>Підрозділ</th>
                <th>Відповідальний</th>
                <th onClick={() => requestSort('total_sum')} style={{cursor:'pointer'}}>Сума {sortConfig.key === 'total_sum' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="5" style={{textAlign:'center'}}>Завантаження...</td></tr> : 
                sortedExpenses.length === 0 ? <tr><td colSpan="5" style={{textAlign:'center'}}>Записів не знайдено</td></tr> :
                sortedExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td className="text-id">{exp.doc_number}</td>
                    <td>{new Date(exp.doc_date).toLocaleDateString('uk-UA')}</td>
                    <td>{exp.department?.name}</td>
                    <td>{exp.responsible}</td>
                    <td style={{color:'var(--danger)', fontWeight:'500'}}>-{Number(exp.total_sum).toLocaleString('uk-UA')} ₴</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onExpenseAdded={fetchExpenses} />
    </>
  );
};

export default Expenses;