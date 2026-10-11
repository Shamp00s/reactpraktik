// ТЗ: "Скрытая кнопка в React — не защита API" — поэтому все проверки здесь,
// на сервере, а не только в ProtectedRoute на фронте.

export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Требуется вход в аккаунт' });
  }
  next();
}

// Владелец записи либо админ — остальным нельзя редактировать/удалять чужое
// даже прямым HTTP-запросом (пункт 02 контрольных сценариев преподавателя).
export function requireOwnerOrAdmin(getItem) {
  return async (req, res, next) => {
    const item = await getItem(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    const isOwner = item.ownerId === req.session.userId;
    const isAdmin = req.session.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Нет прав на эту запись' });
    }
    req.item = item;
    next();
  };
}