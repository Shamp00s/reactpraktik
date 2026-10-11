import { createContext } from 'react';

// Сам контекст авторизации.
// Провайдер лежит в AuthProvider.jsx, хук для доступа — в hooks/useAuth.js
export const AuthContext = createContext(null);