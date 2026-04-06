import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import AddExpenseModal from '../components/AddExpenseModal';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Стани для фільтрів
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Всі підрозділи');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchExpenses = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/expenses')
      .then(res => res.json())
      .then(data => {
        setExpenses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Помилка завантаження витрат:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Отримуємо унікальні підрозділи для фільтра
  const departments = ['Всі підрозділи', ...new Set(expenses.map(e => e.department.name))];

  // Логіка фільтрації
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.doc_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'Всі підрозділи' || e.department.name === selectedDepartment;
    const matchesMonth = selectedMonth ? e.doc_date.startsWith(selectedMonth) : true;
    
    return matchesSearch && matchesDepartment && matchesMonth;
  });

  return (
    <>
      <Topbar 
        title="Витрати" 
        subtitle="Акти списання по підрозділах" 
        buttonText="+ Новий акт" 
        onButtonClick={() => setIsModalOpen(true)} 
      />

      <div className="content-area">
        {/* Панель фільтрів */}
        <div className="filter-bar">
          <input 
            type="text" 
            placeholder="Пошук по акту..." 
            style={{ width: '220px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {departments.map((dep, index) => (
              <option key={index} value={dep}>{dep}</option>
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
            <span className="card-title">Акти витрат</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {loading ? 'Завантаження...' : `${filteredExpenses.length} записів`}
            </span>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>№ акту</th>
                <th>Дата</th>
                <th>Підрозділ</th>
                <th>Відповідальний</th>
                <th>К-сть поз.</th>
                <th>Сума</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Завантаження даних...</td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Актів не знайдено</td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="text-id">{expense.doc_number}</td>
                    <td>{new Date(expense.doc_date).toLocaleDateString('uk-UA')}</td>
                    <td style={{ fontWeight: '500' }}>{expense.department.name}</td>
                    <td>{expense.responsible || '—'}</td>
                    <td>{expense.items?.length || 0}</td>
                    <td style={{ color: 'var(--danger)' }}>
                      –{Number(expense.total_sum).toLocaleString('uk-UA')} ₴
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onExpenseAdded={fetchExpenses} 
      />
    </>
  );
};

export default Expenses;