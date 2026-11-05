import React, { memo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

const HeaderComponent = () => {
  const { user, logout, isAdmin, isEditor, isRegistrado, fetchMenus } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);

  // Load menus from backend when user changes
  useEffect(() => {
    if (user) {
      setLoadingMenus(true);
      fetchMenus().then(setMenus).catch(() => setMenus([])).finally(() => setLoadingMenus(false));
    } else {
      setMenus([]);
    }
  }, [user, fetchMenus]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFavoritosClick = () => {
    if (!user) {
      navigate('/login');
    }
  };

  // Render menus from backend
  const renderMenus = () => {
    if (loadingMenus || !menus.length) {
      return (
        <>
          <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Inicio</Link>
          <Link to="/noticias" className="text-gray-700 hover:text-blue-600 font-medium">Noticias</Link>
          <Link to="/favoritos" className="text-gray-700 hover:text-blue-600 font-medium">Favoritos</Link>
          <Link to="/contacto" className="text-gray-700 hover:text-blue-600 font-medium">Contacto</Link>
        </>
      );
    }

    return menus.map((menu, index) => (
      <React.Fragment key={`${menu.menuPath}-${index}`}>
        {menu.menuLabel === 'Favoritos' && !user ? (
          <span
            onClick={handleFavoritosClick}
            className="text-gray-700 hover:text-blue-600 font-medium cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
          >
            Favoritos
          </span>
        ) : (
          <Link
            to={menu.menuPath}
            className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1"
          >
            {menu.menuIcon && <i className={menu.menuIcon}></i>}
            {menu.menuLabel}
            {menu.menuLabel === 'Favoritos' && favorites.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{favorites.length}</span>
            )}
          </Link>
        )}
      </React.Fragment>
    ));
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
            {renderMenus()}
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Hola, {user.name || user.nombre}</span>
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