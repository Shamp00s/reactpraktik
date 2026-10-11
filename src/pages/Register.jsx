import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import '../styles/AuthForm.css';
import { useAuth } from '../hooks/useAuth.js';

const Register = () => {
  const { user, register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 12 || ageNum > 120) {
      setError('Укажите корректный возраст (от 12 до 120 лет)');
      return;
    }

    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(name.trim(), email.trim(), password, ageNum);
      if (result && result.success === false) {
        setError(result.message || 'Ошибка регистрации');
        setFieldErrors(result.errors || {});
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Не удалось зарегистрироваться. Проверьте данные.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-register container">
      <h2>Регистрация</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Имя
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          Возраст
          <input
            type="number"
            min="12"
            max="120"
            value={age}
            placeholder="Например, 20"
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </label>

        <label>
          Пароль (не менее 6 символов)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <label>
          Повторите пароль
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </button>
      </form>

      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
};

export default Register;