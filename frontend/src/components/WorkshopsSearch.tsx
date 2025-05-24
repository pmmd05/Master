// frontend/src/components/WorkshopsSearch.tsx - DISEÑO MASTERCOOK ACADEMY
import React from 'react';
import { useWorkshops } from '../context/WorkshopsContext';

const WorkshopsSearch: React.FC = () => {
  const { 
    searchTerm, 
    selectedCategory, 
    setSearchTerm, 
    setSelectedCategory,
    loading,
    workshops 
  } = useWorkshops();

  // Categorías disponibles con iconos
  const categories = [
    { name: 'Italiana', icon: '🍝' },
    { name: 'Panadería', icon: '🥖' },
    { name: 'Repostería', icon: '🧁' },
    { name: 'Japonesa', icon: '🍣' },
    { name: 'Vegana', icon: '🥬' },
    { name: 'Mexicana', icon: '🌮' },
    { name: 'Francesa', icon: '🥐' },
    { name: 'Española', icon: '🥘' },
    { name: 'Barbacoa', icon: '🔥' },
    { name: 'Tailandesa', icon: '🍜' },
    { name: 'Bebidas', icon: '🥤' },
    { name: 'China', icon: '🥟' },
    { name: 'India', icon: '🍛' },
    { name: 'Mediterránea', icon: '🫒' }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== '';

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden">
      
      {/* Header del panel de búsqueda */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
        <div className="flex items-center">
          <div className="bg-white/20 rounded-full p-2 mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Encuentra tu Taller Ideal</h3>
            <p className="text-orange-100 text-sm">Busca por nombre, descripción o categoría</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        
        {/* Controles de búsqueda */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* Barra de búsqueda principal */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔍 Buscar talleres
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Ej: pasta, sushi, técnicas de corte..."
                className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-300 text-lg"
              />
              {loading && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                </div>
              )}
              {searchTerm && !loading && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filtro por categoría */}
          <div className="lg:w-80">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏷️ Categoría culinaria
            </label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-300 text-lg"
            >
              <option value="">🌍 Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botón para limpiar filtros */}
          {hasActiveFilters && (
            <div className="lg:w-auto flex items-end">
              <button
                onClick={clearFilters}
                className="px-6 py-4 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Filtros rápidos por categoría */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ⚡ Filtros rápidos
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name === selectedCategory ? '' : category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 border-2 ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-500 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Información de resultados */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center">
              {loading ? (
                <div className="flex items-center text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mr-3"></div>
                  <span className="text-lg font-medium">Buscando talleres increíbles...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-gray-800">
                      {workshops.length} {workshops.length === 1 ? 'taller encontrado' : 'talleres encontrados'}
                    </span>
                    {hasActiveFilters && (
                      <span className="text-gray-600 ml-1">con los filtros aplicados</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Filtros activos */}
            {hasActiveFilters && (
              <div className="mt-3 sm:mt-0 flex items-center flex-wrap gap-2">
                <span className="text-sm text-gray-500 mr-2">Filtros activos:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    "{searchTerm}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <span className="mr-1">{categories.find(c => c.name === selectedCategory)?.icon}</span>
                    {selectedCategory}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sugerencias de búsqueda cuando no hay filtros */}
        {!hasActiveFilters && (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <h4 className="text-sm font-semibold text-amber-800 mb-2">💡 Sugerencias de búsqueda:</h4>
            <div className="flex flex-wrap gap-2">
              {['pasta fresca', 'sushi básico', 'pan artesanal', 'postres franceses', 'cocina vegana'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchTerm(suggestion)}
                  className="px-3 py-1 bg-white text-amber-700 rounded-full text-xs font-medium hover:bg-amber-100 transition-colors duration-200 border border-amber-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopsSearch;