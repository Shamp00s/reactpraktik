import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext.js';
import { authApi } from '../services/api.js';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase сам восстанавливает сессию и уведомляет о каждом изменении —
  // это и заменяет собой ручной fetch('/auth/me').
  useEffect(() => {
    const unsubscribe = authApi.subscribe((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const loggedInUser = await authApi.login(email, password);
      setUser(loggedInUser);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password, age) => {
    try {
      const newUser = await authApi.register(name, email, password, age);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateSettings = async (payload) => {
    try {
      const updated = await authApi.updateSettings(payload);
      setUser(updated);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}