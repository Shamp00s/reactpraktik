import { Link, NavLink, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../conext/CartContext.jsx';

const linkClass = ({ isActive }) => (isActive ? 'active' : undefined);

export default function Header() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const userInitial = user?.name?.trim()?.[0]?.toUpperCase() || '?';

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          Электро<span>Маркет</span>
        </Link>

        <nav className="nav">
          <NavLink to="/" end className={linkClass}>Главная</NavLink>
          <NavLink to="/items" className={linkClass}>Каталог</NavLink>
          <NavLink to="/explore" className={linkClass}>Внешний API</NavLink>
          {user && <NavLink to="/dashboard" className={linkClass}>Управление</NavLink>}
          <NavLink to="/cart" className={linkClass}>Корзина ({totalCount})</NavLink>
        </nav>

        {user ? (
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ background: '#f59e0b', color: '#000', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
                👑 Вы админ
              </Link>
            )}
            <NavLink to="/profile" className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              {user.photo ? (
                <img src={user.photo} alt="Avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                  {userInitial}
                </span>
              )}
              <span>{user.name}</span>
            </NavLink>
            <NavLink to="/settings" title="Настройки" className="btn" style={{ padding: '4px 8px' }}>⚙️</NavLink>
            <button type="button" onClick={handleLogout} className="btn">Выйти</button>
          </div>
        ) : (
          <div className="header-actions">
            <NavLink to="/login" className="btn">Войти</NavLink>
            <NavLink to="/register" className="btn btn-primary">Регистрация</NavLink>
          </div>
        )}
      </div>
    </header>
  );
}