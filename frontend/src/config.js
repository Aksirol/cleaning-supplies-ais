// frontend/src/config.js
export const API_URL = 'http://localhost:5000/api';

// Наша власна функція-обгортка для fetch
export const fetchWithAuth = async (endpoint, options = {}) => {
  // 1. Дістаємо токен з пам'яті браузера
  const token = localStorage.getItem('token');
  
  // 2. Формуємо заголовки, додаючи токен, якщо він є
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  // 3. Робимо запит
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  // 4. ГЛОБАЛЬНИЙ ЗАХИСТ: якщо токен прострочений (401) або права забрали (403)
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Примусово викидаємо на сторінку логіну
    throw new Error('Сесія закінчилась або доступ заборонено');
  }

  return response;
};