import { Link, NavLink, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import { useAuth } from '../hooks/useAuth.js';

const linkClass = ({ isActive }) => (isActive ? 'active' : undefined);

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
          {user?.role === 'admin' && <NavLink to="/admin" className={linkClass}>Админка</NavLink>}
        </nav>

        {user ? (
          <div className="header-actions">
            <NavLink to="/profile" className="user-chip">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="user-avatar" />
              ) : (
                <span className="user-avatar user-avatar--placeholder">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
              <span className="user-name">{user.name}</span>
            </NavLink>
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
};

export default Header;