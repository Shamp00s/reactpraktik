import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/ProductDetails.css';
import { itemsApi } from '../services/api.js';

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'not-found' | 'error'

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setProduct(null);

    itemsApi
      .get(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err?.message === 'Товар не найден' ? 'not-found' : 'error');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') {
    return <div className="page-product-details"><p>Загрузка…</p></div>;
  }

  if (status === 'not-found') {
    return (
      <div className="page-product-details">
        <div className="product-details-state-box">
          <h2>Товар не найден</h2>
          <p>Возможно, его удалили или ссылка устарела.</p>
          <Link to="/items" className="btn btn-primary">← Вернуться в каталог</Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page-product-details">
        <div className="product-details-state-box">Не удалось загрузить товар. Попробуйте позже.</div>
      </div>
    );
  }

  return (
    <div className="page-product-details">
      <div className="product-details-image">
        {product.image ? <img src={product.image} alt={product.title} /> : '🖼️'}
      </div>

      <div className="product-details-info">
        <span className="product-category">{product.category}</span>
        <h2>{product.title}</h2>
        <p className="product-price">{product.price} ₽</p>
        <p>{product.description}</p>
        <p className={`product-stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
          {product.inStock ? '✔ В наличии' : '✖ Нет в наличии'}
        </p>
        <button className="btn btn-primary" disabled={!product.inStock}>
          Добавить в корзину
        </button>
        <p className="product-details-back">
          <Link to="/items">← Вернуться в каталог</Link>
        </p>
      </div>
    </div>
  );
};

export default ProductDetails;