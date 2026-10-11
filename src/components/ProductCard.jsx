import { Link } from 'react-router-dom';
import '../styles/ProductCard.css';

export default function ProductCard({ id, title, price, image, imageUrl }) {
  const fallbackImage = 'https://via.placeholder.com/250x200?text=No+Image';
  const imgSource = image || imageUrl || fallbackImage;

  return (
    <article className="product-card">
      <div className="product-card-img-wrap">
        <img
          src={imgSource}
          alt={title}
          onError={(e) => { e.target.src = fallbackImage; }}
        />
      </div>
      <h3>{title}</h3>
      <p className="price">{price} ₽</p>
      <Link to={`/items/${id}`} className="btn">Подробнее</Link>
    </article>
  );
}