const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Дані для головного дашборду
router.get('/dashboard', async (req, res) => {
  try {
    // 1. Рахуємо загальні суми (для прикладу беремо всі дані, але в реальності можна фільтрувати за датою)
    const totalPurchases = await prisma.purchase.aggregate({ _sum: { total_sum: true } });
    const totalExpenses = await prisma.expense.aggregate({ _sum: { total_sum: true } });

    // 2. Рахуємо загальну вартість залишків на складі
    const stockItems = await prisma.stock.findMany({ include: { good: true } });
    let totalStockValue = 0;
    let criticalItemsCount = 0;

    stockItems.forEach(item => {
      totalStockValue += parseFloat(item.quantity) * parseFloat(item.good.price || 0);
      if (parseFloat(item.quantity) <= parseFloat(item.good.min_stock)) {
        criticalItemsCount++;
      }
    });

    // 3. Витрати по підрозділах (групування)
    const expensesByDept = await prisma.expense.findMany({
      include: { department: true }
    });
    
    const deptTotals = {};
    expensesByDept.forEach(exp => {
      const deptName = exp.department.name;
      if (!deptTotals[deptName]) deptTotals[deptName] = 0;
      deptTotals[deptName] += parseFloat(exp.total_sum);
    });

    // 4. Останні рухи (беремо 3 останні закупівлі і 3 останні витрати, зводимо в один масив)
    const recentPurchases = await prisma.purchase.findMany({
      take: 3, orderBy: { doc_date: 'desc' }, include: { supplier: true }
    });
    const recentExpenses = await prisma.expense.findMany({
      take: 3, orderBy: { doc_date: 'desc' }, include: { department: true }
    });

    // Форматуємо для єдиної таблиці "Останні рухи"
    const movements = [
      ...recentPurchases.map(p => ({
        id: `p-${p.id}`, date: p.doc_date, type: 'Закупівля', 
        entity: p.supplier.name, sum: p.total_sum, doc: p.doc_number
      })),
      ...recentExpenses.map(e => ({
        id: `e-${e.id}`, date: e.doc_date, type: 'Витрата', 
        entity: e.department.name, sum: e.total_sum, doc: e.doc_number
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5); // Сортуємо і беремо топ-5

    // Збираємо фінальну відповідь
    res.json({
      summary: {
        purchased: totalPurchases._sum.total_sum || 0,
        expensed: totalExpenses._sum.total_sum || 0,
        stock_value: totalStockValue,
        critical_count: criticalItemsCount
      },
      expenses_by_department: Object.entries(deptTotals).map(([name, sum]) => ({ name, sum })),
      recent_movements: movements
    });

  } catch (error) {
    console.error('Помилка генерації аналітики:', error);
    res.status(500).json({ error: 'Не вдалося згенерувати дані для дашборду' });
  }
});

module.exports = router;