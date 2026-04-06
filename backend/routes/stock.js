const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Отримати всі залишки на складі
router.get('/', async (req, res) => {
  try {
    const stockItems = await prisma.stock.findMany({
      include: {
        good: true // Підтягуємо всю інформацію про товар (назву, категорію, мін. залишок)
      },
      orderBy: { good: { name: 'asc' } } // Сортуємо за алфавітом
    });

    // Форматуємо дані для зручності фронтенду (додаємо прапорець is_critical)
    const formattedStock = stockItems.map(item => ({
      ...item,
      is_critical: parseFloat(item.quantity) <= parseFloat(item.good.min_stock)
    }));

    res.json(formattedStock);
  } catch (error) {
    console.error('Помилка завантаження складу:', error);
    res.status(500).json({ error: 'Не вдалося завантажити залишки' });
  }
});

module.exports = router;