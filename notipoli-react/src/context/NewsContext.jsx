import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const NewsContext = createContext();

export const useNews = () => useContext(NewsContext);

export function NewsProvider({ children }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets/data/noticias.json')
      .then(res => res.json())
      .then(data => {
        const custom = JSON.parse(localStorage.getItem('notipoli_noticias_custom') || '[]');
        setNews([...custom, ...(data.noticias || [])]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const addNews = useCallback((newsItem) => {
    const newItem = {
      id: `custom_${Date.now()}`,
      ...newsItem,
      fecha: new Date().toISOString().split('T')[0],
      destacada: false
    };
    setNews(prev => {
      const updated = [newItem, ...prev];
      const custom = updated.filter(n => String(n.id).startsWith('custom_'));
      localStorage.setItem('notipoli_noticias_custom', JSON.stringify(custom));
      return updated;
    });
  }, []);

  const deleteNews = useCallback((id) => {
    setNews(prev => {
      const updated = prev.filter(n => String(n.id) !== String(id));
      const custom = updated.filter(n => String(n.id).startsWith('custom_'));
      localStorage.setItem('notipoli_noticias_custom', JSON.stringify(custom));
      return updated;
    });
  }, []);

  const contextValue = useMemo(() => ({ news, loading, addNews, deleteNews }), [news, loading, addNews, deleteNews]);

  return (
    <NewsContext.Provider value={contextValue}>
      {children}
    </NewsContext.Provider>
  );
}
