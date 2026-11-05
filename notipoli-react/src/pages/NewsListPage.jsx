import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import NewsCard from '../components/NewsCard';
import { useLocation } from 'react-router-dom';

export default function NewsListPage() {
  const { news, loading: newsLoading } = useNews();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isFavoritesOnly = queryParams.get('favoritos') === 'true';

  const [favorites, setFavorites] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [categorias, setCategorias] = useState(['Todas']);

  // Cargar categorías desde la API
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const resp = await fetch('/api/categories');
        const data = await resp.json();
        if (resp.ok && data.data) {
          const nombres = data.data.map((c) => c.name);
          setCategorias(['Todas', ...nombres]);
        }
      } catch (e) {
        console.error('Error loading categories:', e);
      }
    };
    loadCategorias();
  }, []);

  // Cargar favoritos del backend cuando es necesario
  useEffect(() => {
    if (isFavoritesOnly) {
      const loadFavorites = async () => {
        setInternalLoading(true);
        try {
          const token = localStorage.getItem('notipoli_token');
          if (!token) {
            setFavorites([]);
            setInternalLoading(false);
            return;
          }

          const resp = await fetch('/api/favorites', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await resp.json();

          // Cargar noticias individualmente para cada favorito
          const favsWithNews = await Promise.all(
            data.favorites.map(async (fav) => {
              try {
                const newsResp = await fetch(`/api/news/${fav.newsId}`);
                const newsData = await newsResp.json();
                return { ...fav, news: newsData.news };
              } catch {
                return { ...fav, news: null };
              }
            })
          );
          setFavorites(favsWithNews);
        } catch {
          setFavorites([]);
        } finally {
          setInternalLoading(false);
        }
      };
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isFavoritesOnly]);

  const loading = newsLoading || internalLoading;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Memoizar favoritos como Set para O(1) lookup
  const favoritesSet = useMemo(() => new Set(favorites.map(f => f.newsId)), [favorites]);

  // Filtrado memoizado
  const filtered = useMemo(() => {
    let result = news;

    if (isFavoritesOnly) {
      result = result.filter(n => favoritesSet.has(String(n.id)));
    }

    if (selectedCategory !== 'Todas') {
      result = result.filter(n => n.categorias?.includes(selectedCategory) || n.categoria === selectedCategory);
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

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <i className="bi bi-folder-x text-4xl text-gray-400 mb-3 block"></i>
          <p className="text-gray-500 text-lg">No se encontraron noticias.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ contain: 'content' }}>
          {filtered.map(noticia => (
            <NewsCard key={noticia.id} noticia={noticia} isFavorite={isFavoritesOnly} />
          ))}
        </div>
      )}
    </div>
  );
}