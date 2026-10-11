import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { usersDb } from '../utils/db.js';

const router = Router();

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Заполните имя, email и пароль' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль должен быть не короче 6 символов' });
    }

    const users = await usersDb.all();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email === normalizedEmail)) {
      return res.status(409).json({ message: 'Пользователь с таким email уже зарегистрирован' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: users.length === 0 ? 'admin' : 'user', // первый зарегистрированный — админ, для демонстрации /admin
    };

    users.push(user);
    await usersDb.save(users);

    req.session.userId = user.id;
    req.session.role = user.role;

    res.status(201).json(publicUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Введите email и пароль' });
    }

    const users = await usersDb.all();
    const user = users.find((u) => u.email === email.trim().toLowerCase());

    // Намеренно одна и та же ошибка и для "нет пользователя", и для "неверный пароль" —
    // чтобы не раскрывать, какие email зарегистрированы.
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    req.session.userId = user.id;
    req.session.role = user.role;

    res.json(publicUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(204).end();
  });
});

// Восстановление сессии после перезагрузки страницы (F5)
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
  const users = await usersDb.all();
  const user = users.find((u) => u.id === req.session.userId);
  if (!user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
  res.json(publicUser(user));
});

export default router;