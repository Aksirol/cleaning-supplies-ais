import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Goods from './pages/Goods';
import Dashboard from './pages/Dashboard'; // <-- Додали імпорт

// Залишилися тільки ці заглушки
const Purchases = () => <div style={{ padding: '20px' }}><h1>Закупівлі</h1><p>Реєстр накладних</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Підключили справжній Dashboard замість заглушки */}
          <Route index element={<Dashboard />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="expenses" element={<div style={{ padding: '20px' }}><h1>Витрати</h1></div>} />
          <Route path="stock" element={<div style={{ padding: '20px' }}><h1>Склад</h1></div>} />
          <Route path="goods" element={<Goods />} />
          <Route path="suppliers" element={<div style={{ padding: '20px' }}><h1>Постачальники</h1></div>} />
          <Route path="analytics" element={<div style={{ padding: '20px' }}><h1>Аналітика</h1></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;