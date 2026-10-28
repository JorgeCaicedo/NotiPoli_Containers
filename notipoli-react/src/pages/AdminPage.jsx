import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const { news, addNews, deleteNews } = useNews();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Educacion');
  const [extracto, setExtracto] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagen, setImagen] = useState('');

  if (!isAdmin()) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
        <p className="text-gray-600 mb-4">No tienes permisos de Administrador.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Ir al Inicio</button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    addNews({ titulo, categoria, extracto, contenido, imagen: imagen || 'https://picsum.photos/800/400' });
    setTitulo('');
    setExtracto('');
    setContenido('');
    setImagen('');
    alert('Noticia agregada con éxito');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Panel de Administración</h1>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Agregar Nueva Noticia</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Educacion">Educación</option>
                <option value="Tecnologia">Tecnología</option>
                <option value="Campus">Campus</option>
                <option value="Deportes">Deportes</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
            <input
              type="text"
              value={imagen}
              onChange={e => setImagen(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extracto</label>
            <textarea
              rows="2"
              value={extracto}
              onChange={e => setExtracto(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido completo (HTML permitido)</label>
            <textarea
              rows="5"
              value={contenido}
              onChange={e => setContenido(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
          >
            Publicar Noticia
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Gestionar Noticias Existentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-sm">
                <th className="py-3 px-4">Título</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {news.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{item.titulo}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.categoria}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{item.fecha}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => deleteNews(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
