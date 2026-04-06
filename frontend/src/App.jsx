import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Goods from './pages/Goods';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses'; // <-- Додано імпорт

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="purchases" element={<Purchases />} />
          
          {/* Підключили сторінку Витрат */}
          <Route path="expenses" element={<Expenses />} />
          
          <Route path="stock" element={<Stock />} />
          <Route path="goods" element={<Goods />} />
          <Route path="suppliers" element={<Suppliers />} />
          
          <Route path="analytics" element={<div style={{ padding: '20px' }}><h1>Аналітика</h1></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;