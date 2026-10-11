import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { itemsDb } from '../utils/db.js';
import { requireAuth, requireOwnerOrAdmin } from '../middleware/auth.js';

const router = Router();

function validateItemPayload(body, { partial = false } = {}) {
  const errors = {};
  const { title, category, price, description, inStock } = body;

  if (!partial || title !== undefined) {
    if (!title || !String(title).trim()) errors.title = 'Укажите название';
  }
  if (!partial || category !== undefined) {
    if (!category || !String(category).trim()) errors.category = 'Укажите категорию';
  }
  if (!partial || price !== undefined) {
    const n = Number(price);
    if (Number.isNaN(n) || n <= 0) errors.price = 'Цена должна быть положительным числом';
  }
  if (!partial || description !== undefined) {
    if (!description || String(description).trim().length < 10) {
      errors.description = 'Описание должно быть не короче 10 символов';
    }
  }
  if (!partial || inStock !== undefined) {
    if (typeof inStock !== 'boolean') errors.inStock = 'Укажите наличие товара';
  }

  return errors;
}

// Публичный список — доступен всем (каталог + внешний список по ТЗ п.02)
router.get('/', async (req, res) => {
  const items = await itemsDb.all();
  const { q } = req.query;

  const filtered = q
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(q.toLowerCase()) ||
          i.category.toLowerCase().includes(q.toLowerCase()),
      )
    : items;

  res.json(filtered);
});

// Личные записи текущего пользователя — ВАЖНО: этот маршрут должен идти
// раньше "/:id", иначе "mine" будет воспринят как :id
router.get('/mine', requireAuth, async (req, res) => {
  const items = await itemsDb.all();
  res.json(items.filter((i) => i.ownerId === req.session.userId));
});

router.get('/:id', async (req, res) => {
  const items = await itemsDb.all();
  const item = items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Товар не найден' });
  res.json(item);
});

router.post('/', requireAuth, async (req, res) => {
  const errors = validateItemPayload(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Проверьте поля формы', errors });
  }

  const items = await itemsDb.all();
  const newItem = {
    id: randomUUID(),
    title: req.body.title.trim(),
    category: req.body.category.trim(),
    price: Number(req.body.price),
    description: req.body.description.trim(),
    inStock: Boolean(req.body.inStock),
    ownerId: req.session.userId,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  await itemsDb.save(items);
  res.status(201).json(newItem);
});

const findById = async (id) => (await itemsDb.all()).find((i) => i.id === id);

router.put('/:id', requireAuth, requireOwnerOrAdmin(findById), async (req, res) => {
  const errors = validateItemPayload(req.body, { partial: true });
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Проверьте поля формы', errors });
  }

  const items = await itemsDb.all();
  const index = items.findIndex((i) => i.id === req.params.id);

  const updated = {
    ...items[index],
    ...('title' in req.body ? { title: req.body.title.trim() } : {}),
    ...('category' in req.body ? { category: req.body.category.trim() } : {}),
    ...('price' in req.body ? { price: Number(req.body.price) } : {}),
    ...('description' in req.body ? { description: req.body.description.trim() } : {}),
    ...('inStock' in req.body ? { inStock: Boolean(req.body.inStock) } : {}),
  };

  items[index] = updated;
  await itemsDb.save(items);
  res.json(updated);
});

router.delete('/:id', requireAuth, requireOwnerOrAdmin(findById), async (req, res) => {
  const items = await itemsDb.all();
  const next = items.filter((i) => i.id !== req.params.id);
  await itemsDb.save(next);
  res.status(204).end();
});

export default router;