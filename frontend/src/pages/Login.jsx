import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, { // <-- Використовуємо звичайний fetch та API_URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // ЗАХИСТ: якщо бекенд повернув не JSON (наприклад, 404 сторінку)
      const contentType = response.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) {
         throw new Error(`Сервер повернув не JSON (Статус: ${response.status})`);
      }

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        navigate('/'); 
      } else {
        setError(data.error || 'Помилка авторизації');
      }
    } catch (err) {
      console.error("Деталі помилки:", err);
      // Тепер замість загального тексту ми побачимо реальну причину на екрані!
      setError(`Збій: ${err.message}`); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Система Обліку</h2>
          <p style={styles.subtitle}>Авторизуйтесь для доступу до складу</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Логін</label>
            <input 
              type="text" 
              name="username" 
              className="form-control" 
              required 
              value={formData.username} 
              onChange={handleChange}
              placeholder="Введіть ваш логін"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input 
              type="password" 
              name="password" 
              className="form-control" 
              required 
              value={formData.password} 
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Прості inline-стилі спеціально для сторінки логіну, щоб не засмічувати index.css
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: 'var(--bg-main)',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid var(--border-color)'
  },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { margin: '0 0 8px 0', fontSize: '24px', color: 'var(--text-main)' },
  subtitle: { margin: 0, color: 'var(--text-muted)', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  button: { width: '100%', padding: '12px', fontSize: '16px', marginTop: '8px' },
  error: { 
    backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', 
    borderRadius: '6px', fontSize: '14px', marginBottom: '16px', textAlign: 'center' 
  },
  footer: { textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)' }
};

export default Login;