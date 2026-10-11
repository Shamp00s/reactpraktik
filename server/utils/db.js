import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

// Простая "база данных" на JSON-файлах — подходит для учебного проекта.
// На каждую операцию чтения/записи — честный доступ к файлу (без кэша в памяти),
// чтобы данные переживали перезапуск сервера (требование ТЗ: "сохраняется на сервере").

async function readJson(file) {
  const full = path.join(DATA_DIR, file);
  const raw = await readFile(full, 'utf-8');
  return JSON.parse(raw);
}

async function writeJson(file, data) {
  const full = path.join(DATA_DIR, file);
  await writeFile(full, JSON.stringify(data, null, 2), 'utf-8');
}

export const usersDb = {
  all: () => readJson('users.json'),
  save: (users) => writeJson('users.json', users),
};

export const itemsDb = {
  all: () => readJson('items.json'),
  save: (items) => writeJson('items.json', items),
};