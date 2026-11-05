import React, { useState, useMemo, useCallback, useEffect } from 'react';
import NewsCard from '../components/NewsCard';

export default function NewsListFavoritePage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [allCategorias, setAllCategorias] = useState(['Todas']);
  const [error, setError] = useState(null);

  // Cargar categorías desde la API
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const resp = await fetch('/api/categories');
        const data = await resp.json();
        if (resp.ok && data.data) {
          const nombres = data.data.map((c) => c.name);
          setAllCategorias(['Todas', ...nombres]);
        }
      } catch (e) {
        console.error('Error loading categories:', e);
      }
    };
    loadCategorias();
  }, []);

  // Cargar favoritos del backend
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('notipoli_token');
        if (!token) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        const resp = await fetch('/api/favorites', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!resp.ok) {
          if (resp.status === 401) {
            localStorage.removeItem('notipoli_token');
            localStorage.removeItem('notipoli_sesion');
            window.location.href = '/login';
            return;
          }
          console.error('Failed to fetch favorites:', resp.status);
          setFavorites([]);
          setLoading(false);
          return;
        }
        const data = await resp.json();
        const favs = data.favorites || [];
        console.log('Favorites data:', favs);
        setFavorites(favs);
      } catch (e) {
        console.error('Error loading favorites:', e);
        setError(e.message);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const token = localStorage.getItem('notipoli_token');
  const hasSession = !!token;

  if (!hasSession) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <i className="bi bi-star text-4xl text-gray-400 mb-3 block"></i>
          <p className="text-gray-500 text-lg">Mis Noticias Favoritas</p>
          <p className="text-gray-400 text-sm mt-2">Debes iniciar sesión para ver tus favoritos.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <i className="bi bi-exclamation-triangle text-4xl text-yellow-500 mb-3 block"></i>
          <p className="text-gray-500 text-lg">Error al cargar favoritos</p>
          <p className="text-gray-400 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Memoizar noticias de favoritos con datos completos
  const newsWithDetails = useMemo(() => {
    if (!favorites || !Array.isArray(favorites)) return [];

    return favorites
      .filter(f => f && f.news)
      .map(f => {
        const n = f.news;
        if (!n) return null;

        return {
          id: n.id,
          titulo: n.title,
          slug: n.slug,
          extracto: n.excerpt,
          contenido: n.content,
          imagen: n.coverImage,
          categoria: n.categories?.[0]?.category?.name || n.category || 'Sin categoría',
          categorias: n.categories?.map((c) => c?.category?.name || c) || [],
          autor: n.author?.name || 'Redacción',
          fecha: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : n.createdAt ? new Date(n.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : '',
          status: n.status,
          tags: n.tags?.map((t) => t?.tag?.name) || [],
        };
      }).filter(Boolean);
  }, [favorites]);

  const filtered = useMemo(() => {
    let result = newsWithDetails;

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
  }, [newsWithDetails, selectedCategory, search]);

  const handleSearchChange = useCallback((e) => setSearch(e.target.value), []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Mis Noticias Favoritas</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar en favoritas..."
            value={search}
            onChange={handleSearchChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {allCategorias.map(cat => (
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
          <i className="bi bi-star text-4xl text-gray-400 mb-3 block"></i>
          <p className="text-gray-500 text-lg">No tienes noticias favoritas.</p>
          <p className="text-gray-400 text-sm mt-2">Haz clic en la estrella de las noticias para agregarlas a favoritos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ contain: 'content' }}>
          {filtered.map(noticia => (
            <NewsCard key={noticia.id} noticia={noticia} isFavorite />
          ))}
        </div>
      )}
    </div>
  );
}