const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET: Дані для головного дашборду
router.get('/dashboard', async (req, res) => {
  try {
    // 1. Рахуємо загальні суми
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

    // 4. Останні рухи (беремо позиції з документів для детального відображення Товар/Кількість)
    const recentPurchaseItems = await prisma.purchaseItem.findMany({
      take: 5,
      orderBy: { purchase: { doc_date: 'desc' } },
      include: {
        good: true,
        purchase: { include: { supplier: true } }
      }
    });
    
    const recentExpenseItems = await prisma.expenseItem.findMany({
      take: 5,
      orderBy: { expense: { doc_date: 'desc' } },
      include: {
        good: true,
        expense: { include: { department: true } }
      }
    });

    // Форматуємо для єдиної таблиці "Останні рухи" з потрібними полями
    const movements = [
      ...recentPurchaseItems.map(pi => ({
        id: `pi-${pi.id}`, 
        date: pi.purchase.doc_date, 
        type: 'Закупівля', 
        good: pi.good.name,
        quantity: pi.quantity,
        unit: pi.good.unit,
        entity: pi.purchase.supplier.name, 
        sum: pi.sum
      })),
      ...recentExpenseItems.map(ei => ({
        id: `ei-${ei.id}`, 
        date: ei.expense.doc_date, 
        type: 'Витрата', 
        good: ei.good.name,
        quantity: ei.quantity,
        unit: ei.good.unit,
        entity: ei.expense.department.name, 
        sum: ei.sum
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

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