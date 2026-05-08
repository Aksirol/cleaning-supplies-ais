require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Мідлвари
app.use(cors());
app.use(express.json());

// ДОДАНО: Імпорт мідлвару для перевірки токена
const { verifyToken } = require('./middleware/auth');

// Імпорт маршрутів
const stockRoutes = require('./routes/stock');
const analyticsRoutes = require('./routes/analytics');
const purchasesRoutes = require('./routes/purchases');
const expensesRoutes = require('./routes/expenses');
const suppliersRoutes = require('./routes/suppliers');
const goodsRoutes = require('./routes/goods');
const departmentsRoutes = require('./routes/departments');
const authRoutes = require('./routes/auth');

// ==========================================
// 1. ВІДКРИТІ МАРШРУТИ (без токена)
// ==========================================
app.use('/api/auth', authRoutes); // Логін має бути доступний всім

app.get('/api/status', (req, res) => {
  res.json({ message: 'Бекенд АІС "Миючі засоби" успішно працює!' });
});

// ==========================================
// 2. ЗАХИЩЕНІ МАРШРУТИ (тільки з токеном)
// ==========================================
// Додаємо verifyToken другим параметром. 
// Тепер ЖОДЕН запит не пройде до цих роутів без валідного токена.
app.use('/api/purchases', verifyToken, purchasesRoutes);
app.use('/api/expenses', verifyToken, expensesRoutes);
app.use('/api/suppliers', verifyToken, suppliersRoutes);
app.use('/api/goods', verifyToken, goodsRoutes);
app.use('/api/departments', verifyToken, departmentsRoutes);
app.use('/api/stock', verifyToken, stockRoutes);
app.use('/api/analytics', verifyToken, analyticsRoutes);
app.use('/api/users', require('./routes/users'));

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});