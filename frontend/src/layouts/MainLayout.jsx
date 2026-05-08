import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const MainLayout = ({ user, setUser }) => {
  const navigate = useNavigate();

  // Функція виходу з системи
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Бокове меню (Sidebar) */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>AIS Cleaning</h2>
        </div>
        
        <nav className="nav-menu">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Дашборд</NavLink>
          <NavLink to="/purchases" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Закупівлі</NavLink>
          <NavLink to="/stock" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Склад</NavLink>
          <NavLink to="/expenses" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Витрати</NavLink>
          <NavLink to="/goods" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Довідник товарів</NavLink>
          <NavLink to="/suppliers" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Постачальники</NavLink>
          <NavLink to="/analytics" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>Аналітика</NavLink>
        </nav>

        {/* НОВИЙ БЛОК: Профіль користувача */}
        <div style={styles.userProfile}>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.full_name || user?.username}</div>
            <div style={styles.userRole}>
              <span className={`badge ${user?.role === 'ADMIN' ? 'badge-warn' : 'badge-ok'}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn" style={styles.logoutBtn}>
            Вийти
          </button>
        </div>
      </aside>

      {/* Основний контент */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

// Прості стилі для блоку користувача (щоб не засмічувати CSS)
const styles = {
  userProfile: {
    marginTop: 'auto', // Притискаємо до низу
    padding: '16px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-main)',
  },
  userInfo: { marginBottom: '12px' },
  userName: { fontWeight: '600', color: 'var(--text-main)', fontSize: '14px', marginBottom: '4px' },
  userRole: { fontSize: '12px' },
  logoutBtn: { width: '100%', fontSize: '13px', padding: '8px' }
};

export default MainLayout;