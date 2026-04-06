import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/analytics/dashboard')
      .then(res => res.json())
      .then(analyticsData => {
        setData(analyticsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Помилка завантаження дашборду:', err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Topbar 
        title="Панель керування" 
        subtitle="Квітень 2026 · ТОВ «Чистота»" 
      />

      <div className="content-area">
        {loading || !data ? (
          <div>Завантаження статистики...</div>
        ) : (
          <>
            {/* Сітка з 4-ма картками */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Вартість залишків</div>
                <div className="stat-value">{Number(data.summary.stock_value).toLocaleString('uk-UA')} ₴</div>
                <div className="stat-note neutral">Поточний стан складу</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Закуплено (всього)</div>
                <div className="stat-value">{Number(data.summary.purchased).toLocaleString('uk-UA')} ₴</div>
                <div className="stat-note up">▲ Витрати на поповнення</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Списано (всього)</div>
                <div className="stat-value">{Number(data.summary.expensed).toLocaleString('uk-UA')} ₴</div>
                <div className="stat-note down">▼ Видано на підрозділи</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Позицій критично мало</div>
                <div className="stat-value">{data.summary.critical_count}</div>
                <div className={data.summary.critical_count > 0 ? "stat-note down" : "stat-note up"}>
                  {data.summary.critical_count > 0 ? "Потребують закупівлі" : "Склад у нормі"}
                </div>
              </div>
            </div>

            {/* Таблиця останніх рухів */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Останні рухи</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Найновіші операції</span>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Тип</th>
                    <th>Товар</th>
                    <th>К-сть</th>
                    <th>Підрозділ / Постач.</th>
                    <th>Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_movements.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>Немає недавніх рухів</td>
                    </tr>
                  ) : (
                    data.recent_movements.map((movement) => (
                      <tr key={movement.id}>
                        <td>{new Date(movement.date).toLocaleDateString('uk-UA')}</td>
                        <td>
                          <span className={`badge ${movement.type === 'Закупівля' ? 'badge-ok' : 'badge-warn'}`}>
                            {movement.type}
                          </span>
                        </td>
                        <td>{movement.good}</td>
                        <td>{Number(movement.quantity)} {movement.unit}</td>
                        <td>{movement.entity}</td>
                        <td style={{ color: movement.type === 'Закупівля' ? 'var(--text-main)' : 'var(--danger)' }}>
                          {movement.type === 'Закупівля' ? '' : '–'}{Number(movement.sum).toLocaleString('uk-UA')} ₴
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

export default Dashboard;