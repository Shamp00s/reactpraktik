import { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import { useAuth } from '../hooks/useAuth.js';
import { itemsApi } from '../services/api.js';
import { CATEGORIES } from '../services/categories.js';

const emptyForm = { title: '', category: '', price: '', description: '', inStock: true, image: '' };

const Dashboard = () => {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = форма создания, иначе id редактируемого товара
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    itemsApi
      .mine()
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
  }, [reloadKey]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
  };

  const startEdit = (item) => {
    setForm({
      title: item.title,
      // Если товар когда-то создан с категорией не из списка (например, пришёл из DummyJSON
      // с английским названием) — не подставляем её в select, пусть выберут заново из списка.
      category: CATEGORIES.includes(item.category) ? item.category : '',
      price: String(item.price),
      description: item.description,
      inStock: item.inStock,
      image: item.image || '',
    });
    setEditingId(item.id);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim() || !form.category || !form.description.trim()) {
      setFormError('Заполните название, выберите категорию и укажите описание');
      return;
    }
    const price = Number(form.price);
    if (Number.isNaN(price) || price <= 0) {
      setFormError('Цена должна быть положительным числом');
      return;
    }
    const image = form.image.trim();
    if (image && !/^https?:\/\//i.test(image)) {
      setFormError('Ссылка на изображение должна начинаться с http:// или https://');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        price,
        description: form.description.trim(),
        inStock: form.inStock,
        image: image || null,
      };

      if (editingId) {
        await itemsApi.update(editingId, payload);
      } else {
        await itemsApi.create(payload);
      }

      resetForm();
      setReloadKey((k) => k + 1);
    } catch {
      setFormError('Не удалось сохранить товар. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот товар?')) return;
    try {
      await itemsApi.remove(id);
      if (editingId === id) resetForm();
      setReloadKey((k) => k + 1);
    } catch {
      alert('Не удалось удалить товар.');
    }
  };

  // Только для admin: разовая загрузка стартового набора товаров из DummyJSON
  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedMessage('');
    try {
      const already = await itemsApi.hasSystemItems();
      if (already) {
        setSeedMessage('Товары из внешнего API уже загружены ранее.');
        return;
      }

      const res = await fetch('https://dummyjson.com/products?limit=12');
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();

      for (const p of data.products) {
        await itemsApi.createSystemItem({
          title: p.title,
          category: p.category,
          price: Math.round(p.price),
          description: p.description,
          inStock: p.stock > 0,
          image: p.thumbnail,
        });
      }

      setSeedMessage(`Загружено товаров: ${data.products.length}`);
      setReloadKey((k) => k + 1);
    } catch {
      setSeedMessage('Не удалось загрузить товары из внешнего API.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="page-dashboard">
      <h2>Управление товарами</h2>
      <p>Здесь можно добавить, отредактировать или удалить свои товары.</p>

      {user?.role === 'admin' && (
        <div className="admin-seed-box">
          <div>
            <strong>Админ-инструмент:</strong> загрузить первые 10–12 товаров каталога из
            внешнего API (DummyJSON). Делается один раз.
          </div>
          <button type="button" className="btn" onClick={handleSeed} disabled={isSeeding}>
            {isSeeding ? 'Загружаем…' : 'Загрузить из DummyJSON'}
          </button>
          {seedMessage && <span className="admin-seed-message">{seedMessage}</span>}
        </div>
      )}

      <section className="dashboard-form-card">
        <h3>{editingId ? 'Редактировать товар' : 'Добавить товар'}</h3>
        <form onSubmit={handleSubmit} className="dashboard-form">
          <div className="form-row">
            <label>
              Название
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              Категория
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Выберите категорию</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Цена, ₽
              <input
                type="number"
                min="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
              />
              В наличии
            </label>
          </div>

          <label>
            Ссылка на фото товара (необязательно)
            <input
              type="url"
              placeholder="https://..."
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </label>

          {form.image.trim() && /^https?:\/\//i.test(form.image.trim()) && (
            <div className="image-preview">
              <img src={form.image.trim()} alt="Предпросмотр" />
            </div>
          )}

          <label>
            Описание
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>

          {formError && <p className="form-error" role="alert">{formError}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняем…' : editingId ? 'Сохранить изменения' : 'Добавить товар'}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={resetForm}>
                Отменить редактирование
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h3>Мои товары</h3>

        {status === 'loading' && <p>Загрузка…</p>}
        {status === 'error' && <div className="dashboard-state-box">Не удалось загрузить товары.</div>}
        {status === 'ready' && items.length === 0 && (
          <div className="dashboard-state-box">Товаров пока нет — добавьте первый выше.</div>
        )}

        {status === 'ready' && items.length > 0 && (
          <ul className="dashboard-item-list">
            {items.map((item) => (
              <li key={item.id} className="dashboard-item-row">
                {item.image ? (
                  <img src={item.image} alt="" className="dashboard-item-thumb" />
                ) : (
                  <div className="dashboard-item-thumb dashboard-item-thumb--placeholder">🖼️</div>
                )}
                <div className="dashboard-item-main">
                  <p className="dashboard-item-title">{item.title}</p>
                  <p className="dashboard-item-meta">
                    {item.category} · {item.price} ₽ · {item.inStock ? 'в наличии' : 'нет в наличии'}
                  </p>
                </div>
                <div className="dashboard-item-actions">
                  <button type="button" className="btn" onClick={() => startEdit(item)}>
                    Редактировать
                  </button>
                  <button type="button" className="btn" onClick={() => handleDelete(item.id)}>
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Dashboard;