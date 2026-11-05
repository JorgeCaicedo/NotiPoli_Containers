import React, { useState, useMemo, useCallback, useEffect } from 'react';
import NewsCard from '../components/NewsCard';

export default function NewsListFavoritePage() {
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [allCategorias, setAllCategorias] = useState(['Todas']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      try {
        const token = localStorage.getItem('notipoli_token');
        if (!token) {
          if (isMounted) {
            setIsAuthenticated(false);
            setFavorites([]);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setIsAuthenticated(true);
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
          const errorText = `Error ${resp.status}`;
          console.error('Failed to fetch favorites:', errorText);
          if (isMounted) {
            setError(errorText);
            setFavorites([]);
          }
          return;
        }

        const data = await resp.json();
        if (isMounted) {
          setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
        }
      } catch (e) {
        console.error('Error loading favorites:', e);
        if (isMounted) {
          setError(e.message || 'Error desconocido');
          setFavorites([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFavorites();

    return () => { isMounted = false; };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const newsWithDetails = useMemo(() => {
    if (!Array.isArray(favorites)) return [];

    return favorites
      .filter(f => f?.news)
      .map(f => {
        const n = f.news;
        if (!n) return null;

        return {
          id: n.id,
          titulo: n.title || '',
          slug: n.slug || '',
          extracto: n.excerpt || '',
          contenido: n.content || '',
          imagen: n.coverImage || null,
          categoria: n.categories?.[0]?.category?.name || n.category || 'Sin categoría',
          categorias: Array.isArray(n.categories)
            ? n.categories.map((c) => c?.category?.name || '').filter(Boolean)
            : [],
          autor: n.author?.name || 'Redacción',
          fecha: formatDate(n.publishedAt) || formatDate(n.createdAt),
          status: n.status || 'DRAFT',
          tags: Array.isArray(n.tags)
            ? n.tags.map((t) => t?.tag?.name).filter(Boolean)
            : [],
        };
      })
      .filter(Boolean);
  }, [favorites]);

  const filtered = useMemo(() => {
    let result = newsWithDetails;

    if (selectedCategory !== 'Todas') {
      result = result.filter(n =>
        (n.categorias && n.categorias.includes(selectedCategory)) ||
        n.categoria === selectedCategory
      );
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(n =>
        n.titulo.toLowerCase().includes(term) ||
        (n.extracto && n.extracto.toLowerCase().includes(term)) ||
        (n.contenido && n.contenido.toLowerCase().includes(term))
      );
    }

    return result;
  }, [newsWithDetails, selectedCategory, search]);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <i className="bi bi-star text-4xl text-gray-400 mb-3 block"></i>
          <p className="text-gray-500 text-lg mb-2">Mis Noticias Favoritas</p>
          <p className="text-gray-400 text-sm mb-4">Debes iniciar sesión para ver tus favoritos.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
          <p className="text-gray-500 text-lg mb-2">Error al cargar favoritos</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
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
          <p className="text-gray-500 text-lg mb-2">No tienes noticias favoritas.</p>
          <p className="text-gray-400 text-sm">Haz clic en la estrella de las noticias para agregarlas a favoritos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ contain: 'content' }}>
          {filtered.map(noticia => (
            <NewsCard key={noticia.id} noticia={noticia} isFavorite={true} />
          ))}
        </div>
      )}
    </div>
  );
}