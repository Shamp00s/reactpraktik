import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Profile.css';
import { useAuth } from '../hooks/useAuth.js';
import { itemsApi } from '../services/api.js';

const roleLabel = { admin: 'Администратор', user: 'Пользователь' };

const Profile = () => {
  const { user, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [deletingId, setDeletingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    itemsApi.mine()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот товар? Действие необратимо.')) return;
    setDeletingId(id);
    try {
      await itemsApi.remove(id);
      setReloadKey((k) => k + 1);
    } catch {
      alert('Не удалось удалить товар. Попробуйте ещё раз.');
    } finally {
      setDeletingId(null);
    }
  };

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || '?';

  return (
    <div className="page-profile container">
      <section className="profile-card">
        <div className="profile-avatar" style={{ overflow: 'hidden' }}>
          {user?.photo ? (
            <img src={user.photo} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initial
          )}
        </div>
        <div className="profile-info">
          <h2>{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span className="profile-role">{roleLabel[user?.role] || user?.role}</span>
            <span className="profile-role" style={{ background: '#313244' }}>Возраст: {user?.age ?? 'не указан'}</span>
            <span className="profile-role" style={{ background: '#f59e0b', color: '#000' }}>⭐ Рейтинг: {user?.rating ?? 5.0}</span>
            {user?.specialContent && (
              <span className="profile-role" style={{ background: '#ec4899', color: '#fff' }}>🔥 Особый контент ВКЛ</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/settings" className="btn btn-primary">
            ⚙️ Настройки
          </Link>
          <button type="button" className="btn" onClick={logout}>
            Выйти
          </button>
        </div>
      </section>

      <section className="profile-items">
        <div className="profile-items-header">
          <h3>Мои добавленные товары</h3>
          <Link to="/dashboard" className="btn btn-primary">
            + Добавить товар
          </Link>
        </div>

        {status === 'loading' && <p>Загрузка…</p>}

        {status === 'error' && (
          <div className="profile-state-box">
            Не удалось загрузить ваши товары.{' '}
            <button type="button" className="btn" onClick={retry}>
              Повторить
            </button>
          </div>
        )}

        {status === 'ready' && items.length === 0 && (
          <div className="profile-state-box">
            Вы ещё не добавили ни одного товара.
          </div>
        )}

        {status === 'ready' && items.length > 0 && (
          <ul className="profile-item-list">
            {items.map((item) => (
              <li key={item.id} className="profile-item-row">
                <div>
                  <p className="profile-item-title">{item.title}</p>
                  <p className="profile-item-meta">
                    {item.category} · {item.price} ₽ · {item.inStock ? 'в наличии' : 'нет в наличии'}
                  </p>
                </div>
                <div className="profile-item-actions">
                  <Link to={`/items/${item.id}`} className="btn">Смотреть</Link>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? 'Удаляем…' : 'Удалить'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Profile;