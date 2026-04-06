const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Отримати всі закупівлі (з деталями постачальника та позиціями)
router.get('/', async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        supplier: true, // Підтягуємо дані постачальника
        items: {
          include: { good: true } // Підтягуємо дані про товар у кожному рядку
        }
      },
      orderBy: { doc_date: 'desc' } // Сортуємо від новіших до старіших
    });
    res.json(purchases);
  } catch (error) {
    console.error('Помилка завантаження закупівель:', error);
    res.status(500).json({ error: 'Не вдалося завантажити дані закупівель' });
  }
});

// POST: Створити нову закупівлю та оновити склад (Транзакція)
router.post('/', async (req, res) => {
  const { supplier_id, doc_date, doc_number, total_sum, status, notes, items } = req.body;

  try {
    // Використовуємо транзакцію: виконуємо всі дії як єдине ціле
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Створюємо документ закупівлі та одразу вкладені позиції (items)
      const newPurchase = await tx.purchase.create({
        data: {
          supplier_id,
          doc_date: new Date(doc_date),
          doc_number,
          total_sum: parseFloat(total_sum),
          status: status || 'Проведено',
          notes,
          items: {
            create: items.map(item => ({
              good_id: item.good_id,
              quantity: parseFloat(item.quantity),
              price: parseFloat(item.price),
              sum: parseFloat(item.sum)
            }))
          }
        },
        include: { items: true }
      });

      // 2. Автоматично оновлюємо залишки на складі (ПЛЮС)
      for (const item of items) {
        await tx.stock.upsert({
          where: { good_id: item.good_id },
          update: { quantity: { increment: parseFloat(item.quantity) } }, // Якщо товар є - додаємо кількість
          create: { good_id: item.good_id, quantity: parseFloat(item.quantity) } // Якщо товару на складі ще не було - створюємо
        });
      }

      return newPurchase;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Помилка при створенні закупівлі:', error);
    res.status(500).json({ error: 'Помилка при створенні документа закупівлі' });
  }
});

module.exports = router;