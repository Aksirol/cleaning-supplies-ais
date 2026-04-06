import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ArrowUpRight, 
  Package, 
  BookOpen, 
  Users, 
  BarChart2 
} from 'lucide-react';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Бокова панель (Sidebar) */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--bg-sidebar)', 
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>АІС «Миючі засоби»</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Облік ТОВ «Чистота»</p>
        </div>

        <nav style={{ padding: '10px 0', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '10px 20px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Головне</div>
          <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="Панель керування" />
          
          <div style={{ padding: '10px 20px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '10px' }}>Облік</div>
          <SidebarItem to="/purchases" icon={<ShoppingCart size={20} />} label="Закупівлі" />
          <SidebarItem to="/expenses" icon={<ArrowUpRight size={20} />} label="Витрати" />
          <SidebarItem to="/stock" icon={<Package size={20} />} label="Склад" />

          <div style={{ padding: '10px 20px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '10px' }}>Довідники</div>
          <SidebarItem to="/goods" icon={<BookOpen size={20} />} label="Товари" />
          <SidebarItem to="/suppliers" icon={<Users size={20} />} label="Постачальники" />

          <div style={{ padding: '10px 20px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '10px' }}>Звіти</div>
          <SidebarItem to="/analytics" icon={<BarChart2 size={20} />} label="Аналітика" />
        </nav>
      </aside>

      {/* Основна робоча область */}
      {/* Основна робоча область */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', overflowY: 'auto' }}>
        <Outlet /> 
      </main>
    </div>
  );
};

// Допоміжний компонент для посилань у меню
const SidebarItem = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        color: isActive ? '#fff' : 'var(--text-muted)',
        backgroundColor: isActive ? 'var(--accent-blue)' : 'transparent',
        transition: 'all 0.2s',
        gap: '12px',
        borderLeft: isActive ? '4px solid #fff' : '4px solid transparent'
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default MainLayout;