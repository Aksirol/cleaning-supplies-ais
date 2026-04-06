import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Goods from './pages/Goods';

// Залишаємо тільки ті заглушки, які ще не мають своїх окремих файлів
const Dashboard = () => <div style={{ padding: '20px' }}><h1>Панель керування</h1><p>Тут буде дашборд</p></div>;
const Purchases = () => <div style={{ padding: '20px' }}><h1>Закупівлі</h1><p>Реєстр накладних</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="expenses" element={<div style={{ padding: '20px' }}><h1>Витрати</h1></div>} />
          <Route path="stock" element={<div style={{ padding: '20px' }}><h1>Склад</h1></div>} />
          {/* Наша підключена сторінка товарів */}
          <Route path="goods" element={<Goods />} />
          <Route path="suppliers" element={<div style={{ padding: '20px' }}><h1>Постачальники</h1></div>} />
          <Route path="analytics" element={<div style={{ padding: '20px' }}><h1>Аналітика</h1></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;