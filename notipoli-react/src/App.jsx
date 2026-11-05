import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { NewsProvider } from './context/NewsContext';

import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import NewsListPage from './pages/NewsListPage';
import NewsListFavoritePage from './pages/NewsListFavoritePage';
import NewsDetailPage from './pages/NewsDetailPage';
import LoginPage from './pages/LoginPage';
import ContactPage from './pages/ContactPage';

// Dynamic import for NewsToolsPage - CRUD de noticias
const NewsToolsPage = lazy(() => import('./pages/NewsToolsPage'));
// Dynamic import for AdminPage - panel de administración
const AdminPage = lazy(() => import('./pages/AdminPage'));

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NewsProvider>
          <FavoritesProvider>
            <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
              <Header />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/noticias" element={<NewsListPage />} />
                    <Route path="/favoritos" element={<NewsListFavoritePage />} />
                    <Route path="/detalle/:id" element={<NewsDetailPage />} />
                    <Route path="/herramientas-noticias" element={<NewsToolsPage />} />
                    <Route path="/administracion" element={<AdminPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/contacto" element={<ContactPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </FavoritesProvider>
        </NewsProvider>
      </AuthProvider>
    </Router>
  );
}