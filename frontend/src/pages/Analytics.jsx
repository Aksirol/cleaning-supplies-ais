import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';

const Analytics = () => {
  const [data, setData] = useState({
    summary: {},
    deptExpenses: [],
    topItems: [],
    suppliersCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Робимо всі 3 запити паралельно для швидкодії
    Promise.all([
      fetch('http://localhost:5000/api/analytics/dashboard').then(r => r.json()),
      fetch('http://localhost:5000/api/expenses').then(r => r.json()),
      fetch('http://localhost:5000/api/suppliers').then(r => r.json())
    ])
    .then(([dashboard, expenses, suppliers]) => {
      
      // 1. Агрегація для "Топ-5 товарів за витратами"
      const itemTotals = {};
      let totalExpenseSum = 0;
      
      expenses.forEach(exp => {
        exp.items.forEach(item => {
           if (!itemTotals[item.good.name]) {
             itemTotals[item.good.name] = { quantity: 0, sum: 0, unit: item.good.unit };
           }
           itemTotals[item.good.name].quantity += Number(item.quantity);
           itemTotals[item.good.name].sum += Number(item.sum);
           totalExpenseSum += Number(item.sum);
        });
      });

      // Сортуємо, вираховуємо відсоток і беремо перші 5
      const sortedTopItems = Object.entries(itemTotals)
        .map(([name, stat]) => ({ 
          name, 
          ...stat, 
          percentage: totalExpenseSum > 0 ? ((stat.sum / totalExpenseSum) * 100).toFixed(1) : 0 
        }))
        .sort((a, b) => b.sum - a.sum)
        .slice(0, 5);

      // Зберігаємо все у єдиний стан
      setData({
        summary: dashboard.summary,
        deptExpenses: dashboard.expenses_by_department.sort((a, b) => b.sum - a.sum), // Від найбільшого до найменшого
        topItems: sortedTopItems,
        suppliersCount: suppliers.length
      });
      setLoading(false);
    })
    .catch(err => {
      console.error('Помилка завантаження аналітики:', err);
      setLoading(false);
    });
  }, []);

  // Функція для призначення кольору стовпчику по черзі
  const getBarColor = (index) => {
    const colors = ['bar-blue', 'bar-green', 'bar-amber'];
    return colors[index % colors.length];
  };

  // Шукаємо найбільшу суму витрат підрозділу, щоб взяти її за 100% ширини шкали
  const maxDeptSum = data.deptExpenses.length > 0 ? Math.max(...data.deptExpenses.map(d => d.sum)) : 1;

  return (
    <>
      <Topbar 
        title="Аналітика" 
        subtitle="Звіти та статистика" 
        buttonText="⬇ Експорт PDF" 
        onButtonClick={() => window.print()} // Проста реалізація друку екрану
      />

      <div className="content-area">
        {loading ? (
          <div>Генерація звітів...</div>
        ) : (
          <>
            {/* Верхні картки (статистика загалом) */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Закуплено (всього)</div>
                <div className="stat-value">{Number(data.summary.purchased).toLocaleString('uk-UA')} ₴</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Витрачено (всього)</div>
                <div className="stat-value">{Number(data.summary.expensed).toLocaleString('uk-UA')} ₴</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Залишки на складі</div>
                <div className="stat-value">{Number(data.summary.stock_value).toLocaleString('uk-UA')} ₴</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">К-сть постачальників</div>
                <div className="stat-value">{data.suppliersCount}</div>
              </div>
            </div>

            {/* Графік: Витрати по підрозділах */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Витрати по підрозділах</span>
              </div>
              <div className="chart-bar-wrap">
                {data.deptExpenses.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)' }}>Немає даних про витрати</div>
                ) : (
                  data.deptExpenses.map((dept, index) => {
                    const widthPercent = (dept.sum / maxDeptSum) * 100;
                    return (
                      <div className="bar-row" key={index}>
                        <div className="bar-label">{dept.name}</div>
                        <div className="bar-track">
                          <div 
                            className={`bar-fill ${getBarColor(index)}`} 
                            style={{ width: `${widthPercent}%` }}
                          >
                            {Number(dept.sum).toLocaleString('uk-UA')} ₴
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Таблиця: Топ-5 товарів */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Топ-5 товарів за обсягом витрат</span>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Товар</th>
                    <th>К-сть</th>
                    <th>Сума</th>
                    <th>% від загального</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>Немає даних</td>
                    </tr>
                  ) : (
                    data.topItems.map((item, index) => (
                      <tr key={index}>
                        <td className="text-muted">{index + 1}</td>
                        <td style={{ fontWeight: '500' }}>{item.name}</td>
                        <td>{item.quantity} {item.unit}</td>
                        <td style={{ color: 'var(--danger)' }}>{Number(item.sum).toLocaleString('uk-UA')} ₴</td>
                        <td>
                          <span className="badge badge-ok">{item.percentage}%</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Analytics;