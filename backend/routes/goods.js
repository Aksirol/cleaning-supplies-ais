const express = require('express');
const router = express.Router();
const prisma = require('../db');

const validate = require('../middleware/validate');
const { expenseSchema } = require('../validators/schemas');

// PUT: Оновити дані товару
const { goodSchema } = require('../validators/schemas');
const validate = require('../middleware/validate');

router.put('/:id', validate(goodSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedGood = await prisma.good.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(updatedGood);
  } catch (error) {
    console.error('Помилка оновлення товару:', error);
    res.status(500).json({ error: 'Не вдалося оновити дані товару' });
  }
});

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
router.post('/', validate(expenseSchema), async (req, res) => {
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

// DELETE: Видалити товар
router.delete('/:id', async (req, res) => {
  try {
    await prisma.good.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    // Якщо помилка P2003 - це спрацював захист Foreign Key
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Неможливо видалити товар: він вже фігурує у закупівлях або актах витрат.' });
    }
    res.status(500).json({ error: 'Помилка видалення' });
  }
});

module.exports = router;