import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

const HeaderComponent = () => {
  const { user, logout, isAdmin, isRegistrado } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  // Derive boolean values during render instead of calling functions
  const isUserRegistrado = isRegistrado();
  const isUserAdmin = isAdmin();

  // Memoize logout handler
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <i className="bi bi-newspaper"></i> NotiPoli
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Inicio</Link>
            <Link to="/noticias" className="text-gray-700 hover:text-blue-600 font-medium">Noticias</Link>
            {isUserRegistrado && (
              <Link to="/noticias?favoritos=true" className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1">
                Favoritos <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{favorites.length}</span>
              </Link>
            )}
            <Link to="/contacto" className="text-gray-700 hover:text-blue-600 font-medium">Contacto</Link>
            {isUserAdmin && (
              <Link to="/admin" className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1">
                <i className="bi bi-shield-lock"></i> Admin
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Hola, {user.nombre}</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium transition"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(HeaderComponent);
