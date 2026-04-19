const express = require('express');
const router = express.Router();
const prisma = require('../db');

const validate = require('../middleware/validate');
const { expenseSchema } = require('../validators/schemas');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { edrpou: { contains: search, mode: 'insensitive' } }
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Помилка завантаження постачальників' });
  }
});

// PUT: Оновити дані існуючого постачальника
router.put('/:id', validate(supplierSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.supplier.update({
      where: { id: Number(id) },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося оновити дані постачальника' });
  }
});

// POST: Створити нового постачальника
router.post('/', validate(expenseSchema), async (req, res) => {
  const { name, edrpou, contact_person, phone, email, address } = req.body;
  try {
    const newSupplier = await prisma.supplier.create({
      data: { name, edrpou, contact_person, phone, email, address }
    });
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка при створенні постачальника' });
  }
});

// DELETE: Видалити постачальника
router.delete('/:id', async (req, res) => {
  try {
    await prisma.supplier.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    // Якщо помилка P2003 - це спрацював захист Foreign Key
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Неможливо видалити постачальника: від нього існують проведені закупівлі.' });
    }
    res.status(500).json({ error: 'Помилка видалення постачальника' });
  }
});

module.exports = router;