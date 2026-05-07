// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// Секретний ключ для підпису токенів (в реальних проектах береться з .env)
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-diploma-key-2026';

// 1. Перевірка наявності та валідності токена
const verifyToken = (req, res, next) => {
  // Токен зазвичай передається в заголовку Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Доступ заборонено. Немає токена авторизації.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Записуємо дані користувача (id, role) в об'єкт запиту
    next(); // Пропускаємо запит далі
  } catch (error) {
    return res.status(403).json({ error: 'Недійсний або прострочений токен.' });
  }
};

// 2. Перевірка ролі (RBAC)
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // req.user вже існує завдяки verifyToken
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Доступ заборонено. Недостатньо прав для виконання цієї дії.' 
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
  JWT_SECRET
};