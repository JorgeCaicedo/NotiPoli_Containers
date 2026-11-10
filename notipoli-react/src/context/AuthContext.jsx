import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AUTH_SESSION_KEY = 'notipoli_sesion';
const TOKEN_KEY = 'notipoli_token';

/* Roles del backend mapeados al frontend */
const ROLE_MAP = {
  'ADMIN': 'Admin',
  'EDITOR': 'Editor',
  'VIEWER': 'Registrado'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage and verify validity
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_SESSION_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (stored && token) {
      try {
        const userData = JSON.parse(stored);
        // Verify token is still valid by checking /me endpoint
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(resp => {
            if (!resp.ok) throw new Error('Token invalid');
          })
          .then(() => {
            // Si solo tiene rol mapeado (rol), obtener el rol original del backend
            if (userData.rol && !userData.role) {
              userData.role = {
                'Admin': 'ADMIN',
                'Editor': 'EDITOR',
                'Registrado': 'VIEWER'
              }[userData.rol];
            }
            setUser(userData);
          })
          .catch(() => {
            // Token invalid/expired, clear storage
            localStorage.removeItem(AUTH_SESSION_KEY);
            localStorage.removeItem(TOKEN_KEY);
          })
          .finally(() => setLoading(false));
      } catch (_) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();

      if (resp.status === 200 || data.accessToken) {
        // Mapear roles del backend (ADMIN, EDITOR, VIEWER) al frontend
        const userWithMappedRole = {
          ...data.user,
          rol: ROLE_MAP[data.user.role] || 'Registrado'
        };
        setUser(userWithMappedRole);
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userWithMappedRole));
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        return { success: true, user: userWithMappedRole, accessToken: data.accessToken, refreshToken: data.refreshToken };
      }
      return { success: false, message: data.message || 'Credenciales incorrectas' };
    } catch (e) {
      return { success: false, message: 'Error al iniciar sesión' };
    }
  }, []);

  const register = useCallback(async (nombre, email, password) => {
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, password }),
      });
      const data = await resp.json();

      if (resp.status === 201 || data.accessToken) {
        // Mapear roles del backend al frontend (usuarios nuevos son VIEWER -> Registrado)
        const userWithMappedRole = {
          ...data.user,
          rol: ROLE_MAP[data.user.role] || 'Registrado'
        };
        setUser(userWithMappedRole);
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userWithMappedRole));
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        return { success: true, user: userWithMappedRole, accessToken: data.accessToken, refreshToken: data.refreshToken };
      }
      return { success: false, message: data.message || 'Error al registrar' };
    } catch (e) {
      return { success: false, message: 'Error al registrar' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const isAdmin = useCallback(() => user?.rol === 'Admin', [user]);
  const isEditor = useCallback(() => user?.rol === 'Editor', [user]);
  const isRegistrado = useCallback(() => user?.rol === 'Registrado', [user]);

  // Fetch menus from backend - uses JWT role if authenticated, query param otherwise
  const fetchMenus = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      // El backend puede obtener el rol del JWT, así que solo necesitamos el token
      if (!token) return [];

      const resp = await fetch('/api/auth/menus', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      return data.menus || [];
    } catch (e) {
      return [];
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    user,
    login,
    register,
    logout,
    isAdmin,
    isEditor,
    isRegistrado,
    loading,
    fetchMenus
  }), [user, login, register, logout, isAdmin, isEditor, isRegistrado, loading, fetchMenus]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}