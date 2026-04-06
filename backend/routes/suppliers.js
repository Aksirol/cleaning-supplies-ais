const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

module.exports = router;