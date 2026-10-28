import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AUTH_SESSION_KEY = 'notipoli_sesion';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_SESSION_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch (_) {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const resp = await fetch('/assets/data/usuarios.json');
      const data = await resp.json();
      const users = [...(data.usuarios || []), ...(JSON.parse(localStorage.getItem('notipoli_usuarios_custom') || '[]'))];
      const found = users.find(u => u.email === email && u.password === password);

      if (found) {
        setUser(found);
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(found));
        return { success: true, user: found };
      }
      return { success: false, message: 'Credenciales incorrectas' };
    } catch (e) {
      return { success: false, message: 'Error al iniciar sesión' };
    }
  }, []);

  const register = useCallback(async (nombre, email, password) => {
    try {
      const customUsers = JSON.parse(localStorage.getItem('notipoli_usuarios_custom') || '[]');
      const newUser = {
        id: `user_${Date.now()}`,
        nombre,
        email,
        password,
        rol: 'Registrado',
        creado: new Date().toISOString().split('T')[0]
      };
      customUsers.push(newUser);
      localStorage.setItem('notipoli_usuarios_custom', JSON.stringify(customUsers));
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Error al registrar' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_SESSION_KEY);
  }, []);

  const isAdmin = useCallback(() => user?.rol === 'Admin', [user]);
  const isRegistrado = useCallback(() => user?.rol === 'Registrado' || isAdmin(), [user, isAdmin]);

  const contextValue = useMemo(() => ({ user, login, register, logout, isAdmin, isRegistrado, loading }), [user, login, register, logout, isAdmin, isRegistrado, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
