import { Link } from 'react-router-dom';


export default function ProductCard({ id, title, price, image }) {
  const fallbackImage = 'https://via.placeholder.com/250x200?text=No+Image';

  return (
    <article className="product-card">
      <div className="product-card-img-wrap">
        <img
          src={image || fallbackImage}
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