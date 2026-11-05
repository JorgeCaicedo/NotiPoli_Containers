import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const NewsContext = createContext();

export const useNews = () => useContext(NewsContext);

export function NewsProvider({ children }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar noticias desde el backend
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('notipoli_token');
        const headers = {};

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const resp = await fetch('/api/news', { headers });
        const data = await resp.json();

        if (resp.ok && data.data) {
          // Transformar datos del backend al formato esperado por el frontend
          const transformed = data.data.map((n) => ({
            id: n.id,
            titulo: n.title,
            slug: n.slug,
            extracto: n.excerpt,
            contenido: n.content,
            imagen: n.coverImage,
            categoria: n.categories?.[0]?.category?.name || 'Sin categoría',
            categorias: n.categories?.map((c) => c.category?.name) || [],
            autor: n.author?.name || 'Redacción',
            fecha: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : new Date(n.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            status: n.status,
            tags: n.tags?.map((t) => t.tag?.name) || [],
          }));
          setNews(transformed);
        } else if (data.message) {
          // Mensaje de error o datos vacíos
          setNews([]);
        } else {
          setNews([]);
        }
      } catch (e) {
        console.error('Error loading news:', e);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const addNews = useCallback((newsItem) => {
    // Para ahora, simplemente agregamos al estado local
    // En producción, esto debería hacer POST a la API
    const newItem = {
      id: `temp_${Date.now()}`,
      titulo: newsItem.titulo,
      slug: newsItem.titulo.toLowerCase().replace(/\s+/g, '-'),
      extracto: newsItem.extracto,
      contenido: newsItem.contenido,
      imagen: newsItem.imagen,
      categoria: newsItem.categoria,
      autor: 'Usuario',
      fecha: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      tags: [],
    };
    setNews(prev => [newItem, ...prev]);
  }, []);

  const deleteNews = useCallback((id) => {
    setNews(prev => prev.filter(n => String(n.id) !== String(id)));
  }, []);

  const contextValue = useMemo(() => ({ news, loading, addNews, deleteNews }), [news, loading, addNews, deleteNews]);

  return (
    <NewsContext.Provider value={contextValue}>
      {children}
    </NewsContext.Provider>
  );
}