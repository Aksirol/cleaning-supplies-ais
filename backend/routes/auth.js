// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login - Вхід у систему
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Шукаємо користувача в базі
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Невірний логін або пароль' });
    }

    // 2. Перевіряємо пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Невірний логін або пароль' });
    }

    // 3. Генеруємо JWT токен (дійсний 12 годин)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // 4. Відправляємо токен і дані користувача на фронтенд
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Помилка авторизації:', error);
    res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});

// GET /api/auth/me - Отримання даних поточного користувача (по токену)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, full_name: true, role: true } // Пароль не повертаємо!
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Помилка отримання даних користувача' });
  }
});

module.exports = router;