const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET: Отримати всі підрозділи
router.get('/', async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка при отриманні підрозділів' });
  }
});

module.exports = router;