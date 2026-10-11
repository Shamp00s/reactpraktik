import { useContext } from 'react';
import { AuthContext } from '../conext/AuthContext.js';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен вызываться внутри <AuthProvider>');
  }
  return context;
}