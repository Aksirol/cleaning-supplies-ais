// backend/middleware/validate.js
const validate = (schema) => (req, res, next) => {
  try {
    // Перевіряємо тіло запиту
    schema.parse(req.body);
    next(); // Якщо все ок, пропускаємо далі до контролера
  } catch (err) {
    // Якщо помилка валідації, формуємо зрозумілу відповідь
    const errorMessages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    return res.status(400).json({
      error: 'Помилка валідації даних',
      details: errorMessages
    });
  }
};

module.exports = validate;