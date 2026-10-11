import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import '../styles/Admin.css';
import { useAuth } from '../hooks/useAuth.js';
import { adminApi } from '../services/api.js';

const roleLabel = { admin: 'Администратор', user: 'Пользователь' };

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .listUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Доступ только для admin. Это для UX — реальная защита в firestore.rules
  // (изменить чужую роль без admin нельзя, что бы ни показывал интерфейс).
if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const toggleRole = async (target) => {
    const nextRole = target.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Сделать «${target.name}» ${roleLabel[nextRole].toLowerCase()}ом?`)) return;
    setBusyId(target.id);
    try {
      await adminApi.setRole(target.id, nextRole);
      setReloadKey((k) => k + 1);
    } catch {
      alert('Не удалось изменить роль.');
    } finally {
      setBusyId(null);
    }
  };

  const removeProfile = async (target) => {
    if (
      !confirm(
        `Удалить профиль «${target.name}»? Сам логин в Firebase останется — удалится только карточка профиля (имя, роль, возраст, рейтинг).`,
      )
    )
      return;
    setBusyId(target.id);
    try {
      await adminApi.deleteProfile(target.id);
      setReloadKey((k) => k + 1);
    } catch {
      alert('Не удалось удалить профиль.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page-admin">
      <h2>Пользователи</h2>
      <p>Всего: {status === 'ready' ? users.length : '…'}</p>

      {status === 'loading' && <p>Загрузка…</p>}
      {status === 'error' && <div className="admin-state-box">Не удалось загрузить список.</div>}

      {status === 'ready' && (
        <ul className="admin-user-list">
          {users.map((u) => (
            <li key={u.id} className="admin-user-row">
              {u.photoURL ? (
                <img src={u.photoURL} alt="" className="admin-user-avatar" />
              ) : (
                <div className="admin-user-avatar admin-user-avatar--placeholder">
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}

              <div className="admin-user-info">
                <p className="admin-user-name">
                  {u.name} {u.id === user.id && <span className="admin-you-tag">(вы)</span>}
                </p>
                <p className="admin-user-meta">
                  {u.email} · {u.age ?? '—'} лет · ★ {u.rating ?? '—'}
                </p>
              </div>

              <span className={`admin-role-badge admin-role-badge--${u.role}`}>
                {roleLabel[u.role] || u.role}
              </span>

              <div className="admin-user-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => toggleRole(u)}
                  disabled={busyId === u.id || u.id === user.id}
                  title={u.id === user.id ? 'Нельзя изменить свою же роль' : undefined}
                >
                  {u.role === 'admin' ? 'Снять admin' : 'Сделать admin'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => removeProfile(u)}
                  disabled={busyId === u.id || u.id === user.id}
                >
                  Удалить профиль
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Admin;