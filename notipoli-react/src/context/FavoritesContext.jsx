import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();
const FAVORITOS_KEY_PREFIX = 'notipoli_favoritos_';

export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  // Memoizar el key del usuario para evitar re-ejecuciones del efecto
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      const key = FAVORITOS_KEY_PREFIX + userId;
      const stored = localStorage.getItem(key);
      try {
        setFavorites(stored ? JSON.parse(stored) : []);
      } catch (e) {
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  }, [userId]);

  // Memoizar toggleFavorite con useCallback
  const toggleFavorite = useCallback((id) => {
    if (!userId) return false;
    const key = FAVORITOS_KEY_PREFIX + userId;
    const strId = String(id);
    setFavorites(prev => {
      const newFavs = prev.includes(strId)
        ? prev.filter(f => f !== strId)
        : [...prev, strId];
      localStorage.setItem(key, JSON.stringify(newFavs));
      return newFavs;
    });
    return true;
  }, [userId]);

  // Memoizar isFavorito
  const isFavorito = useCallback((id) => favorites.includes(String(id)), [favorites]);

  // Memoizar el valor del contexto
  const contextValue = useMemo(() => ({ favorites, toggleFavorite, isFavorito }), [favorites, toggleFavorite, isFavorito]);

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
}
