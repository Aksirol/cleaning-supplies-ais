const express = require('express');
const router = express.Router();
const prisma = require('../db');

const validate = require('../middleware/validate');
const { purchaseSchema } = require('../validators/schema');

// GET: Отримати всі закупівлі (з підтримкою серверної фільтрації)
router.get('/', async (req, res) => {
  try {
    // Додаємо page та limit (за замовчуванням 1 сторінка, 50 записів)
    const { search, supplier, month, page = 1, limit = 50 } = req.query;
    let whereClause = {};

    if (search) whereClause.doc_number = { contains: search, mode: 'insensitive' };
    if (supplier && supplier !== 'Всі постачальники') whereClause.supplier = { name: supplier };
    if (month) {
      const startDate = new Date(`${month}-01T00:00:00.000Z`);
      const nextMonth = new Date(startDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      whereClause.doc_date = { gte: startDate, lt: nextMonth };
    }

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Виконуємо два запити паралельно для швидкодії
    const [totalCount, purchases] = await prisma.$transaction([
      prisma.purchase.count({ where: whereClause }), // Рахуємо загальну кількість
      prisma.purchase.findMany({                     // Беремо конкретну сторінку
        where: whereClause,
        include: { supplier: true, items: true },
        orderBy: { doc_date: 'desc' },
        skip: skip,
        take: pageSize
      })
    ]);

    // Повертаємо дані + інформацію для пагінації
    res.json({
      data: purchases,
      meta: {
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });

  } catch (error) {
    console.error('Помилка завантаження закупівель:', error);
    res.status(500).json({ error: 'Помилка завантаження закупівель' });
  }
});

// POST: Створити нову закупівлю та оновити склад (Транзакція)
router.post('/', validate(purchaseSchema), async (req, res) => {
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