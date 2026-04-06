const express = require('express');
const purchasesRoutes = require('./routes/purchases');
const expensesRoutes = require('./routes/expenses');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Мідлвари
app.use(cors());
app.use(express.json());

// Імпорт маршрутів
const suppliersRoutes = require('./routes/suppliers');
const goodsRoutes = require('./routes/goods');
const departmentsRoutes = require('./routes/departments');

// Використання маршрутів
app.use('/api/purchases', purchasesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/goods', goodsRoutes);
app.use('/api/departments', departmentsRoutes);

// Базовий тестовий маршрут
app.get('/api/status', (req, res) => {
  res.json({ message: 'Бекенд АІС "Миючі засоби" успішно працює!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});