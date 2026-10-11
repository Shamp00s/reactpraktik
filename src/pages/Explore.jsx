import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import '../styles/catalog.css';

// Простая витрина внешнего API (DummyJSON) — отдельно от каталога магазина.
// Это и есть "работа с внешним API" из ТЗ: реальный fetch, loading/error/empty, поиск, отмена запроса.
const PAGE_SIZE = 12;

const Explore = () => {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [query, setQuery] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    const url = query.trim()
      ? `https://dummyjson.com/products/search?q=${encodeURIComponent(query.trim())}&limit=${PAGE_SIZE}`
      : `https://dummyjson.com/products?limit=${PAGE_SIZE}`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('bad response');
        return res.json();
      })
      .then((data) => {
        setProducts(data.products || []);
        setStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // компонент размонтирован/поиск сменился — не ошибка
        setStatus('error');
      });

    // Если query меняется до того, как пришёл ответ — отменяем предыдущий запрос
    return () => controller.abort();
  }, [query, retryKey]);

  return (
    <div className="page-explore">
      <h2>Внешняя база данных (API)</h2>
      <p>Товары из открытого API DummyJSON — пример работы с внешними данными.</p>

      <div className="catalog-toolbar">
        <input
          type="text"
          placeholder="Поиск по DummyJSON..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {status === 'loading' && <p>Загрузка…</p>}

      {status === 'error' && (
        <div className="catalog-state-box">
          <p>Не удалось загрузить товары из внешнего API. Проверьте соединение с интернетом.</p>
          <button type="button" className="btn btn-primary" onClick={() => setRetryKey((k) => k + 1)}>
            Повторить
          </button>
        </div>
      )}

      {status === 'ready' && products.length === 0 && (
        <div className="catalog-state-box">
          {query ? `По запросу «${query}» ничего не найдено.` : 'Товары не найдены.'}
        </div>
      )}

      {status === 'ready' && products.length > 0 && (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} id={p.id} title={p.title} price={p.price} image={p.thumbnail} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;