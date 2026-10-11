import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';
import { useAuth } from '../hooks/useAuth.js';

const THEME_KEY = 'user-theme';

const Settings = () => {
  const { user, updateSettings } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || 'system');

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const changeTheme = (value) => {
    setTheme(value);
    localStorage.setItem(THEME_KEY, value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUrl = photoURL.trim();
    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      setError('Ссылка на аватар должна начинаться с http:// или https://');
      return;
    }

    setIsSaving(true);
    const result = await updateSettings({ name: name.trim(), photoURL: trimmedUrl || null });
    setIsSaving(false);

    if (!result.success) {
      setError(result.message);
      return;
    }
    navigate('/profile');
  };
  

  const previewValid = photoURL.trim() && /^https?:\/\//i.test(photoURL.trim());

  return (
    <div className="page-settings">
      <div className="settings-header">
        <h1>Настройки</h1>
        <p>Управляйте профилем и внешним видом</p>
      </div>

      {/* Тема */}
      <section className="settings-card">
        <h2 className="card-title">Оформление</h2>

        <div className="theme-row">
          <button
            type="button"
            onClick={() => changeTheme('system')}
            className={`theme-btn${theme === 'system' ? ' theme-btn--active' : ''}`}
          >
            <span className="theme-icon">🖥️</span>
            <span>Как в системе</span>
            {theme === 'system' && <span className="theme-check">✓</span>}
          </button>
          <button
            type="button"
            onClick={() => changeTheme('light')}
            className={`theme-btn${theme === 'light' ? ' theme-btn--active' : ''}`}
          >
            <span className="theme-icon">☀️</span>
            <span>Светлая</span>
            {theme === 'light' && <span className="theme-check">✓</span>}
          </button>
          <button
            type="button"
            onClick={() => changeTheme('dark')}
            className={`theme-btn${theme === 'dark' ? ' theme-btn--active' : ''}`}
          >
            <span className="theme-icon">🌑</span>
            <span>Тёмная</span>
            {theme === 'dark' && <span className="theme-check">✓</span>}
          </button>
        </div>
      </section>

      {/* Профиль */}
      <section className="settings-card">
        <h2 className="card-title">Профиль</h2>

        <form onSubmit={handleSave}>
          <div className="field-group">
            <label className="field-label" htmlFor="settings-name">Отображаемое имя</label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="settings-avatar">Ссылка на аватар (необязательно)</label>
            <input
              id="settings-avatar"
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://..."
            />

            <div className="avatar-row">
              <div className="avatar-preview">
                {previewValid ? (
                  <img src={photoURL.trim()} alt="Аватар" />
                ) : (
                  <span className="avatar-placeholder">{name?.[0]?.toUpperCase() || '?'}</span>
                )}
              </div>
              <p className="avatar-hint">
                Вставьте прямую ссылку на изображение (например, из DummyJSON, imgur и т.п.) —
                загрузка файлов отключена, чтобы не требовать платный тариф Firebase Storage.
              </p>
            </div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="settings-actions">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Сохранение…' : 'Сохранить изменения'}
            </button>
            <button type="button" className="btn" onClick={() => navigate('/profile')}>
              Отмена
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Settings;