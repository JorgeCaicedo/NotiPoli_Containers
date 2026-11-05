import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

const NewsCardComponent = ({ noticia, isFavorite }) => {
  const { toggleFavorite, isFavorito } = useFavorites();

  const isFav = isFavorite !== undefined ? isFavorite : isFavorito(noticia.id);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col transition hover:shadow-lg" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 300px' }}>
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={noticia.imagen || 'https://picsum.photos/400/300'}
          alt={noticia.titulo}
          className="w-full h-full object-cover transition hover:scale-105 duration-300"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
          {noticia.categoria}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span><i className="bi bi-calendar3"></i> {noticia.fecha}</span>
            <span><i className="bi bi-person"></i> {noticia.autor || 'Redacción'}</span>
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
            {noticia.titulo}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {noticia.extracto}
          </p>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            to={`/detalle/${noticia.id}`}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1"
          >
            Leer más <i className="bi bi-arrow-right"></i>
          </Link>
          <button
            onClick={() => toggleFavorite(noticia.id)}
            className={`text-xl transition ${isFav ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <i className={`bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(NewsCardComponent);
