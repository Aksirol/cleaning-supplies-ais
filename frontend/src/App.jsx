import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Goods from './pages/Goods';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases'; // <-- Додаємо імпорт закупівель

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* Підключили сторінку закупівель */}
          <Route path="purchases" element={<Purchases />} />
          
          {/* Ці сторінки ще чекають своєї черги */}
          <Route path="expenses" element={<div style={{ padding: '20px' }}><h1>Витрати</h1></div>} />
          <Route path="analytics" element={<div style={{ padding: '20px' }}><h1>Аналітика</h1></div>} />
          
          <Route path="stock" element={<Stock />} />
          <Route path="goods" element={<Goods />} />
          <Route path="suppliers" element={<Suppliers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;