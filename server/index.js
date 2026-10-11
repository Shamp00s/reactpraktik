import express from 'express';
import session from 'express-session';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import itemsRoutes from './routes/items.js';

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(express.json());

// ВРЕМЕННО для диагностики — потом можно убрать
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// credentials:true — чтобы браузер отправлял HttpOnly cookie сессии к API
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

app.use(
  session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me', // см. README про .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // true обязательно за HTTPS в проде
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 дней
    },
  }),
);

app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут API не найден' });
});

app.listen(PORT, () => {
  console.log(`API сервер запущен: http://localhost:${PORT}`);
});