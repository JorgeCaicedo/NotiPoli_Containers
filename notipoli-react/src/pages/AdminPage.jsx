import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verificar permisos
  if (!isAdmin()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <i className="bi bi-shield-lock text-4xl text-gray-400 mb-3"></i>
          <p className="text-gray-500">No tienes permiso para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  // Cargar datos del panel de administración
  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('notipoli_token');
        if (!token) return;

        // Cargar estadísticas
        const statsResp = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const statsData = await statsResp.json();
        setStats(statsData);

        // Cargar usuarios
        const usersResp = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const usersData = await usersResp.json();
        setUsers(usersData.users || []);
      } catch (e) {
        console.error('Error loading admin data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Panel de Administración</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <i className="bi bi-person-badge text-2xl text-blue-600"></i>
                <div>
                  <p className="text-sm text-gray-500">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || users.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <i className="bi bi-newspaper text-2xl text-green-600"></i>
                <div>
                  <p className="text-sm text-gray-500">Noticias Publicadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.publishedNews || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <i className="bi bi-star text-2xl text-yellow-600"></i>
                <div>
                  <p className="text-sm text-gray-500">Favoritos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalFavorites || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <i className="bi bi-cloud-upload text-2xl text-purple-600"></i>
                <div>
                  <p className="text-sm text-gray-500">Archivos Subidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.uploadsCount || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-600 text-sm">
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(userItem => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{userItem.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{userItem.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full text-white bg-purple-500">
                          {userItem.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          userItem.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                        }`}>
                          {userItem.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay usuarios registrados.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}