import { Link } from 'react-router-dom';
import '../styles/Home.css'
const Home = () => {
  return (
    <div className="page-home">
      <section className="hero">
        <h1>Магазин электроники</h1>
        <p>Смартфоны, ноутбуки, аудио и умные устройства по честным ценам.</p>
        <Link to="/items" className="btn-primary">
          Перейти в каталог
        </Link>
      </section>

      <section className="home-categories">
        <h2>Категории</h2>
        <ul>
          <li>Смартфоны</li>
          <li>Ноутбуки</li>
          <li>Аудио</li>
          <li>Носимая электроника</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;