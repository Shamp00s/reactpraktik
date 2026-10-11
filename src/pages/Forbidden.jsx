import { Link } from 'react-router-dom';
import '../styles/Forbidden.css';

// Страница 403 — для случаев, когда пользователь авторизован, но роль не подходит
// (например, обычный user открыл /admin напрямую через URL).
const Forbidden = () => {
  return (
    <div className="page-forbidden">
      <h1>403</h1>
      <h2>Доступ запрещён</h2>
      <p>У вашей учётной записи нет прав для просмотра этой страницы.</p>
      <Link to="/" className="btn btn-primary">На главную</Link>
    </div>
  );
};

export default Forbidden;