import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import '../styles/catalog.css';
import { itemsApi } from '../services/api.js';
import { CATEGORIES } from '../services/categories.js';

const Catalog = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(''); // '' = все категории

  useEffect(() => {
    let cancelled = false;
    itemsApi
      .list()
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
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = items.filter((p) => {
    const matchesQuery = normalizedQuery
      ? p.title.toLowerCase().includes(normalizedQuery) ||
        p.category.toLowerCase().includes(normalizedQuery)
      : true;
    const matchesCategory = category ? p.category === category : true;
    return matchesQuery && matchesCategory;
  });

  const isFiltered = Boolean(query || category);

  return (
    <div className="page-catalog">
      <h2>Каталог товаров</h2>
      <p>Товары, которые добавили пользователи магазина.</p>

      <div className="catalog-toolbar">
        <input
          type="text"
          placeholder="Поиск товара..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Все категории</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {status === 'loading' && <p>Загрузка…</p>}

      {status === 'error' && (
        <div className="catalog-state-box">Не удалось загрузить каталог. Попробуйте позже.</div>
      )}

      {status === 'ready' && filtered.length === 0 && (
        <div className="catalog-state-box">
          {isFiltered ? 'По заданным условиям ничего не найдено.' : 'В каталоге пока нет товаров.'}
        </div>
      )}

      {status === 'ready' && filtered.length > 0 && (
        <div className="product-grid">
          {filtered.map((item) => {
            const itemImage = item.image || item.imageUrl || item.img || item.photo || item.picture || item.url;
            return (
              <ProductCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                image={itemImage}
                imageUrl={itemImage}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Catalog;