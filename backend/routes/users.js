const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');

// Захищаємо весь файл мідлварами
router.use(verifyToken);
router.use(checkRole(['ADMIN']));

// GET /api/users - Отримати список усіх користувачів
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        full_name: true,
        role: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Помилка отримання списку користувачів' });
  }
});

// POST /api/users - Створити нового користувача
router.post('/', async (req, res) => {
  const { username, password, full_name, role } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: 'Користувач з таким логіном вже існує' });

    const password_hash = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({
      data: { username, password_hash, full_name, role }
    });

    res.status(201).json({ message: 'Користувача створено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при створенні користувача' });
  }
});

// DELETE /api/users/:id - Видалити користувача
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Ви не можете видалити самого себе' });
  }

  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Користувача видалено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка видалення' });
  }
});

module.exports = router;