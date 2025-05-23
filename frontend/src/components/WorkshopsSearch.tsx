// frontend/src/components/WorkshopsSearch.tsx
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

  // Categorías disponibles
  const categories = [
    'Italiana', 'Panadería', 'Repostería', 'Japonesa', 'Vegana', 
    'Mexicana', 'Francesa', 'Española', 'Barbacoa', 'Tailandesa', 
    'Bebidas', 'China', 'India', 'Mediterránea'
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Barra de búsqueda */}
        <div className="flex-1 w-full lg:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar talleres por nombre o descripción..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Filtro por categoría */}
        <div className="w-full lg:w-64">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Botón para limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Información de resultados */}
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-600">
        <div>
          {loading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></div>
              Buscando talleres...
            </span>
          ) : (
            <span>
              {workshops.length} {workshops.length === 1 ? 'taller encontrado' : 'talleres encontrados'}
              {hasActiveFilters && ' con los filtros aplicados'}
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <div className="mt-2 sm:mt-0">
            <span className="text-gray-500">Filtros activos:</span>
            {searchTerm && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                "{searchTerm}"
              </span>
            )}
            {selectedCategory && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {selectedCategory}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopsSearch;