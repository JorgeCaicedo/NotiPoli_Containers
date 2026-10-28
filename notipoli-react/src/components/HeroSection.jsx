import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

const HeroSectionComponent = ({ noticia }) => {
  const { toggleFavorite, isFavorito } = useFavorites();

  if (!noticia) return null;

  const isFav = isFavorito(noticia.id);

  return (
    <div className="relative bg-blue-900 text-white rounded-xl overflow-hidden shadow-xl mb-8">
      <div className="absolute inset-0">
        <img
          src={noticia.imagen || 'https://picsum.photos/800/400'}
          alt={noticia.titulo}
          className="w-full h-full object-cover opacity-30"
          loading="lazy"
        />
      </div>
      <div className="relative max-w-7xl mx-auto py-16 px-6 sm:py-24 sm:px-8 lg:px-12 flex flex-col items-start">
        <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
          {noticia.categoria}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 max-w-3xl">
          {noticia.titulo}
        </h1>
        <p className="text-lg text-gray-200 max-w-2xl mb-8">
          {noticia.extracto}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={`/detalle/${noticia.id}`}
            className="bg-white text-blue-900 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg shadow transition"
          >
            Leer artículo completo
          </Link>
          <button
            onClick={() => toggleFavorite(noticia.id)}
            className={`p-3 rounded-lg border border-white/40 hover:bg-white/10 transition flex items-center justify-center ${isFav ? 'text-red-400 bg-white/10' : 'text-white'}`}
            title="Guardar en favoritos"
            aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <i className={`bi ${isFav ? 'bi-heart-fill' : 'bi-heart'} text-xl`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(HeroSectionComponent);
