// backend/routes/expenses.js
const express = require('express');
const router = express.Router();
const prisma = require('../db'); // Використовуємо Singleton Prisma
const validate = require('../middleware/validate');
const { expenseSchema } = require('../validators/schemas');

// GET: Отримати всі витрати з серверною фільтрацією
router.get('/', async (req, res) => {
  try {
    const { month, department, search } = req.query;
    let whereClause = {};

    if (search) {
      whereClause.doc_number = { contains: search, mode: 'insensitive' };
    }

    if (department && department !== 'Всі підрозділи') {
      whereClause.department = { name: department };
    }

    if (month) {
      const startDate = new Date(`${month}-01T00:00:00.000Z`);
      const nextMonth = new Date(startDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      whereClause.doc_date = { gte: startDate, lt: nextMonth };
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        department: true,
        items: { include: { good: true } }
      },
      orderBy: { doc_date: 'desc' },
      take: 50 // Обмеження вибірки (пагінація)
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Помилка завантаження актів списання' });
  }
});

// POST: Створити акт витрат з валідацією та перевіркою залишків
router.post('/', validate(expenseSchema), async (req, res) => {
  const { department_id, doc_date, doc_number, responsible, total_sum, items } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Створюємо заголовок акту
      const expense = await tx.expense.create({
        data: {
          department_id,
          doc_date: new Date(doc_date),
          doc_number,
          responsible,
          total_sum,
          items: {
            create: items.map(item => ({
              good_id: item.good_id,
              quantity: item.quantity,
              price: item.price,
              sum: item.sum
            }))
          }
        }
      });

      // 2. Списання зі складу з ПЕРЕВІРКОЮ НАЛИЧНОСТІ (Виправлення багу #4)
      for (const item of items) {
        const stock = await tx.stock.findUnique({ where: { good_id: item.good_id } });
        
        if (!stock || Number(stock.quantity) < Number(item.quantity)) {
          throw new Error(`Недостатньо товару на складі: ID ${item.good_id}`);
        }

        await tx.stock.update({
          where: { good_id: item.good_id },
          data: { quantity: { decrement: parseFloat(item.quantity) } }
        });
      }

      return expense;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Помилка проведення акту' });
  }
});

module.exports = router;