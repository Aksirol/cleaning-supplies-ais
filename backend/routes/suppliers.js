const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET: Отримати всіх постачальників
router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка при отриманні постачальників' });
  }
});

// POST: Створити нового постачальника
router.post('/', async (req, res) => {
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