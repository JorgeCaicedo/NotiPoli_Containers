import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNews } from '../context/NewsContext';

export default function NewsToolsPage() {
  const { user, isAdmin, isEditor } = useAuth();
  const { news, loading } = useNews();
  const navigate = useNavigate();
  const { id } = useParams();

  // Verificar permisos
  const canEdit = isEditor() || isAdmin();
  const canDelete = isAdmin();

  if (!user || (!canEdit && !canDelete)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <i className="bi bi-shield-lock text-4xl text-gray-400 mb-3"></i>
          <p className="text-gray-500">No tienes permiso para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  // Determinar si es creación o edición
  const isEdit = Boolean(id);
  const newsToEdit = news.find(n => n.id === id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Editar Noticia' : 'Crear Noticia'}
      </h1>
      <p className="text-gray-600 mb-8">
        Esta herramienta permitirá gestionar noticias (crear, editar, eliminar).
      </p>
    </div>
  );
}