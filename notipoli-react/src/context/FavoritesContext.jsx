import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar favoritos desde el backend cuando el usuario cambia
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const loadFavorites = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('notipoli_token');
        if (!token) {
          setFavorites([]);
          return;
        }

        const resp = await fetch('/api/favorites', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await resp.json();
        // Solo devolver IDs para compatibilidad con isFavorito y toggleFavorite
        setFavorites(data.favorites.map(f => f.newsId));
      } catch (e) {
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  // Toggle favorito usando la API del backend
  const toggleFavorite = useCallback(async (id) => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('notipoli_token');
      if (!token) return false;

      const isCurrentlyFavorite = favorites.includes(String(id));

      if (isCurrentlyFavorite) {
        // Quitar de favoritos
        await fetch(`/api/favorites/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setFavorites(prev => prev.filter(f => f !== String(id)));
      } else {
        // Agregar a favoritos
        await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newsId: id }),
        });
        setFavorites(prev => [...prev, String(id)]);
      }

      return true;
    } catch (e) {
      return false;
    }
  }, [user, favorites]);

  // Verificar si es favorito
  const isFavorito = useCallback((id) => favorites.includes(String(id)), [favorites]);

  // Valor del contexto
  const contextValue = useMemo(() => ({
    favorites,
    loading,
    toggleFavorite,
    isFavorito,
  }), [favorites, loading, toggleFavorite, isFavorito]);

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
}