const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET: Отримати всі товари
router.get('/', async (req, res) => {
  try {
    const goods = await prisma.good.findMany();
    res.json(goods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка при отриманні товарів' });
  }
});

// POST: Додати новий товар
router.post('/', async (req, res) => {
  const { name, category, unit, min_stock, price, notes } = req.body;
  try {
    const newGood = await prisma.good.create({
      data: { 
        name, 
        category, 
        unit, 
        min_stock: parseFloat(min_stock), 
        price: price ? parseFloat(price) : null, 
        notes 
      }
    });
    res.status(201).json(newGood);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка при створенні товару' });
  }
});

module.exports = router;