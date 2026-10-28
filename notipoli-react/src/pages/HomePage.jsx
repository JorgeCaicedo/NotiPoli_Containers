import React, { useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import HeroSection from '../components/HeroSection';
import NewsCard from '../components/NewsCard';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { news, loading } = useNews();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Memoizar la noticia destacada y las recientes
  const { destacada, recienLlegadas } = useMemo(() => {
    const dest = news.find(n => n.destacada) || news[0];
    const recientes = news.filter(n => String(n.id) !== String(dest?.id)).slice(0, 6);
    return { destacada: dest, recienLlegadas: recientes };
  }, [news]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {destacada && <HeroSection noticia={destacada} />}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Noticias Recientes</h2>
        <Link to="/noticias" className="text-blue-600 hover:underline font-medium text-sm">
          Ver todas <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ contain: 'content' }}>
        {recienLlegadas.map(noticia => (
          <NewsCard key={noticia.id} noticia={noticia} />
        ))}
      </div>
    </div>
  );
}
