import React, { useState, useMemo, useCallback } from 'react';
import { useNews } from '../context/NewsContext';
import { useFavorites } from '../context/FavoritesContext';
import NewsCard from '../components/NewsCard';
import { useLocation } from 'react-router-dom';

export default function NewsListPage() {
  const { news, loading } = useNews();
  const { favorites } = useFavorites();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isFavoritesOnly = queryParams.get('favoritos') === 'true';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Memoizar categorías únicas
  const categorias = useMemo(() => ['Todas', ...new Set(news.map(n => n.categoria).filter(Boolean))], [news]);

  // Memoizar favoritos como Set para O(1) lookup
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  // Filtrado memoizado
  const filtered = useMemo(() => {
    let result = news;

    if (isFavoritesOnly) {
      result = result.filter(n => favoritesSet.has(String(n.id)));
    }

    if (selectedCategory !== 'Todas') {
      result = result.filter(n => n.categoria === selectedCategory);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(n =>
        n.titulo.toLowerCase().includes(term) ||
        n.extracto?.toLowerCase().includes(term) ||
        n.contenido?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [news, isFavoritesOnly, favoritesSet, selectedCategory, search]);

  // Memoizar handler para evitar re-renders innecesarios
  const handleSearchChange = useCallback((e) => setSearch(e.target.value), []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          {isFavoritesOnly ? 'Mis Noticias Favoritas' : 'Todas las Noticias'}
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar noticias..."
            value={search}
            onChange={handleSearchChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <i className="bi bi-folder-x text-4xl text-gray-400 mb-3 block"></i>
          <p className="text-gray-500 text-lg">No se encontraron noticias.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ contain: 'content' }}>
          {filtered.map(noticia => (
            <NewsCard key={noticia.id} noticia={noticia} />
          ))}
        </div>
      )}
    </div>
  );
}
