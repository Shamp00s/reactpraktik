// Сервисный слой поверх Firebase (Authentication + Firestore).
// Имена экспортов (authApi, itemsApi, adminApi, ApiError) стабильны —
// AuthProvider, Profile, Dashboard, Admin и т.д. от них зависят.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase.js';

export class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Пользователь с таким email уже зарегистрирован',
  'auth/invalid-email': 'Некорректный email',
  'auth/weak-password': 'Пароль должен быть не короче 6 символов',
  'auth/invalid-credential': 'Неверный email или пароль',
  'auth/wrong-password': 'Неверный email или пароль',
  'auth/user-not-found': 'Неверный email или пароль',
  'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
  'auth/network-request-failed': 'Нет связи с сервером. Проверьте интернет',
};

function mapAuthError(err) {
  return new ApiError(AUTH_ERROR_MESSAGES[err.code] || 'Ошибка авторизации', err.code);
}

async function buildUser(fbUser) {
  if (!fbUser) return null;
  const snap = await getDoc(doc(db, 'users', fbUser.uid));
  const profile = snap.exists() ? snap.data() : {};
  return {
    id: fbUser.uid,
    name: profile.name || fbUser.displayName || fbUser.email,
    email: fbUser.email,
    role: profile.role || 'user',
    age: profile.age ?? null,
    rating: profile.rating ?? 5,
    photoURL: profile.photoURL || fbUser.photoURL || null,
  };
}

export const authApi = {
  subscribe(onChange) {
    return onAuthStateChanged(auth, async (fbUser) => {
      onChange(await buildUser(fbUser));
    });
  },

  async register(name, email, password, age) {
    try {
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(fbUser, { displayName: name });

      const profile = {
        name,
        email,
        role: 'user', // роль по умолчанию; на admin меняется вручную в Firestore или через /admin
        age: Number(age),
        rating: 5,
        photoURL: null,
      };
      await setDoc(doc(db, 'users', fbUser.uid), profile);

      return { id: fbUser.uid, ...profile };
    } catch (err) {
      throw mapAuthError(err);
    }
  },

  async login(email, password) {
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
      return buildUser(fbUser);
    } catch (err) {
      throw mapAuthError(err);
    }
  },

  async logout() {
    await signOut(auth);
  },

async updateSettings({ name, photoURL }) {
  const fbUser = auth.currentUser;
  if (!fbUser) throw new ApiError('Требуется вход в аккаунт');

console.log('--- ДИАГНОСТИКА ---');
console.log('currentUser UID:', fbUser?.uid);
console.log('currentUser email:', fbUser?.email);
console.log('auth привязан к проекту:', auth.app.options.projectId);
console.log('db привязан к проекту:', db.app.options.projectId);
console.log('auth и db — один и тот же app?', auth.app === db.app);
console.log('-------------------');

    await updateProfile(fbUser, { displayName: name, photoURL: photoURL || null });
    await updateDoc(doc(db, 'users', fbUser.uid), { name, photoURL: photoURL || null });

    return buildUser(fbUser);
  },
};

const EXTERNAL_API_SOURCE = 'dummyjson';

export const itemsApi = {
  async list(q) {
    const snap = await getDocs(collection(db, 'items'));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (!q) return items;
    const needle = q.toLowerCase();
    return items.filter(
      (i) => i.title.toLowerCase().includes(needle) || i.category.toLowerCase().includes(needle),
    );
  },

  async mine() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new ApiError('Требуется вход в аккаунт');
    const snap = await getDocs(query(collection(db, 'items'), where('ownerId', '==', uid)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async get(id) {
    const snap = await getDoc(doc(db, 'items', id));
    if (!snap.exists()) throw new ApiError('Товар не найден');
    return { id: snap.id, ...snap.data() };
  },

  async create(payload) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new ApiError('Требуется вход в аккаунт');
    const docRef = await addDoc(collection(db, 'items'), {
      title: payload.title,
      category: payload.category,
      price: Number(payload.price),
      description: payload.description,
      inStock: Boolean(payload.inStock),
      image: payload.image || null,
      ownerId: uid,
      source: 'user',
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ownerId: uid, source: 'user', ...payload };
  },

  async update(id, payload) {
    await updateDoc(doc(db, 'items', id), payload);
    return { id, ...payload };
  },

  async remove(id) {
    await deleteDoc(doc(db, 'items', id));
  },

  async createSystemItem(payload) {
    const docRef = await addDoc(collection(db, 'items'), {
      ...payload,
      ownerId: null,
      source: EXTERNAL_API_SOURCE,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...payload };
  },

  async hasSystemItems() {
    const snap = await getDocs(
      query(collection(db, 'items'), where('source', '==', EXTERNAL_API_SOURCE), limit(1)),
    );
    return !snap.empty;
  },
};

export const adminApi = {
  async listUsers() {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async setRole(uid, role) {
    await updateDoc(doc(db, 'users', uid), { role });
  },

  async deleteProfile(uid) {
    await deleteDoc(doc(db, 'users', uid));
  },
};