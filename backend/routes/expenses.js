const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET: Отримати всі акти витрат (з підрозділами та позиціями)
router.get('/', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        department: true,
        items: {
          include: { good: true }
        }
      },
      orderBy: { doc_date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    console.error('Помилка завантаження витрат:', error);
    res.status(500).json({ error: 'Не вдалося завантажити дані актів витрат' });
  }
});

// POST: Створити новий акт витрати та списати зі складу (Транзакція)
router.post('/', async (req, res) => {
  const { department_id, doc_date, doc_number, responsible, total_sum, notes, items } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Створюємо документ витрати та його рядки
      const newExpense = await tx.expense.create({
        data: {
          department_id,
          doc_date: new Date(doc_date),
          doc_number,
          responsible,
          total_sum: parseFloat(total_sum),
          notes,
          items: {
            create: items.map(item => ({
              good_id: item.good_id,
              quantity: parseFloat(item.quantity),
              price: parseFloat(item.price), // Беремо облікову ціну
              sum: parseFloat(item.sum)
            }))
          }
        },
        include: { items: true }
      });

      // 2. Автоматично списуємо товари зі складу (МІНУС) з перевіркою
      for (const item of items) {
        // Спочатку перевіряємо поточний залишок
        const currentStock = await tx.stock.findUnique({
          where: { good_id: item.good_id }
        });

        if (!currentStock || Number(currentStock.quantity) < Number(item.quantity)) {
          // Якщо товару немає або його менше, ніж хочемо списати — скасовуємо всю транзакцію
          throw new Error(`Недостатньо товару на складі для списання позиції ID: ${item.good_id}`);
        }

        // Якщо все ок — мінусуємо
        await tx.stock.update({
          where: { good_id: item.good_id },
          data: { quantity: { decrement: parseFloat(item.quantity) } }
        });
      }

      return newExpense;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Помилка при створенні витрати:', error);
    res.status(500).json({ error: 'Помилка при збереженні акту витрати (можливо, товару недостатньо на складі)' });
  }
});

module.exports = router;