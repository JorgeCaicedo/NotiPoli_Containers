import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} NotiPoli. Todos los derechos reservados. Migrado a React + Vite.
        </p>
      </div>
    </footer>
  );
}
