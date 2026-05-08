import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Goods from './pages/Goods';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Stock from './pages/Stock';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Login from './pages/Login';

function App() {
  // Стан для зберігання поточного користувача
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // При першому завантаженні перевіряємо, чи є токен у localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsCheckingAuth(false);
  }, []);

  // Компонент-обгортка для захисту приватних маршрутів
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  if (isCheckingAuth) return <div>Завантаження...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Публічний маршрут */}
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={setUser} /> : <Navigate to="/" replace />} 
        />

        {/* Захищені маршрути (тільки для авторизованих) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              {/* Передаємо user та setUser в Layout, щоб там зробити кнопку Виходу */}
              <MainLayout user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="goods" element={<Goods />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="stock" element={<Stock />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        
        {/* Будь-який інший шлях перекидає на головну */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;