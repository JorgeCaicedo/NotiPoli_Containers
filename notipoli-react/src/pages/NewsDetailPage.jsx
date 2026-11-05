import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { useFavorites } from '../context/FavoritesContext';

// Generate unique placeholder image URL based on slug
const getPlaceholderImage = (slug) => {
  const seed = encodeURIComponent(slug || 'default');
  return `https://picsum.photos/seed/${seed}/800/400`;
};

export default function NewsDetailPage() {
  const { id } = useParams();
  const { news, loading } = useNews();
  const { toggleFavorite, isFavorito } = useFavorites();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const noticia = news.find(n => String(n.id) === String(id));

  if (!noticia) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Noticia no encontrada</h2>
        <Link to="/" className="text-blue-600 hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  // Use existing image or generate unique placeholder based on slug
  const imageUrl = noticia.imagen || noticia.coverImage || getPlaceholderImage(noticia.slug);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/noticias" className="text-blue-600 hover:underline font-medium text-sm flex items-center gap-1 mb-6">
        <i className="bi bi-arrow-left"></i> Volver a noticias
      </Link>

      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
        {noticia.categoria}
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
        {noticia.titulo}
      </h1>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <span><i className="bi bi-calendar3"></i> {noticia.fecha}</span>
          <span><i className="bi bi-person"></i> {noticia.autor || 'Redacción NotiPoli'}</span>
        </div>
        <button
          onClick={() => toggleFavorite(noticia.id)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition ${isFavorito(noticia.id) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
        >
          <i className={`bi ${isFavorito(noticia.id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          {isFavorito(noticia.id) ? 'Favorito' : 'Guardar'}
        </button>
      </div>

      <div className="mb-8 rounded-xl overflow-hidden shadow-lg h-[400px]">
        <img src={imageUrl} alt={noticia.titulo} className="w-full h-full object-cover" />
      </div>

      <div className="prose max-w-none text-gray-800 leading-relaxed space-y-4">
        <p className="text-xl font-medium text-gray-600 mb-6">{noticia.extracto}</p>
        <div dangerouslySetInnerHTML={{ __html: noticia.contenido || '<p>Contenido completo no disponible.</p>' }} />
      </div>
    </div>
  );
}
