// frontend/src/components/WorkshopsSearch.tsx - CON ESTILOS MASTERCOOK ACADEMY
import React from 'react';
import { useWorkshops } from '../context/WorkshopsContext';
import './estilos/workshops.css';

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
    <div className="workshops-search-container">
      
      {/* Header del panel de búsqueda */}
      <div className="workshops-search-header">
        <div className="workshops-search-header-content">
          <div className="workshops-search-header-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="workshops-search-header-title">Encuentra tu Taller Ideal</h3>
            <p className="workshops-search-header-subtitle">Busca por nombre, descripción o categoría</p>
          </div>
        </div>
      </div>

      <div className="workshops-search-content">
        
        {/* Controles de búsqueda */}
        <div className="workshops-search-controls">
          <div className="workshops-search-main-controls">
            
            {/* Barra de búsqueda principal */}
            <div className="workshops-search-field">
              <label className="workshops-search-field-label">
                🔍 Buscar talleres
              </label>
              <div className="workshops-search-input-container">
                <svg className="workshops-search-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Ej: pasta, sushi, técnicas de corte..."
                  className="workshops-search-input"
                />
                {loading && (
                  <div className="workshops-search-loading-indicator">
                    <div className="workshops-loading-spinner"></div>
                  </div>
                )}
                {searchTerm && !loading && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="workshops-search-clear-button"
                  >
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por categoría */}
            <div className="workshops-search-field">
              <label className="workshops-search-field-label">
                🏷️ Categoría culinaria
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="workshops-search-select"
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
              <div className="workshops-search-clear-filters-container">
                <button
                  onClick={clearFilters}
                  className="workshops-search-clear-filters"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Filtros rápidos por categoría */}
          <div className="workshops-search-quick-filters">
            <label className="workshops-search-quick-filters-title">
              ⚡ Filtros rápidos
            </label>
            <div className="workshops-search-quick-filters-grid">
              {categories.slice(0, 8).map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name === selectedCategory ? '' : category.name)}
                  className={`workshops-search-quick-filter ${
                    selectedCategory === category.name ? 'active' : ''
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Información de resultados */}
          <div className="workshops-search-results-info">
            <div className="workshops-search-results-count">
              {loading ? (
                <div className="workshops-loading-content">
                  <div className="workshops-loading-spinner"></div>
                  <span className="workshops-loading-text">Buscando talleres increíbles...</span>
                </div>
              ) : (
                <>
                  <div className="workshops-search-results-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="workshops-search-results-text">
                      {workshops.length} {workshops.length === 1 ? 'taller encontrado' : 'talleres encontrados'}
                    </span>
                    {hasActiveFilters && (
                      <span> con los filtros aplicados</span>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Filtros activos */}
            {hasActiveFilters && (
              <div className="workshops-search-active-filters">
                <span>Filtros activos:</span>
                {searchTerm && (
                  <span className="workshops-search-active-filter">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    "{searchTerm}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="workshops-search-active-filter">
                    <span>{categories.find(c => c.name === selectedCategory)?.icon}</span>
                    {selectedCategory}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Sugerencias de búsqueda cuando no hay filtros */}
          {!hasActiveFilters && (
            <div className="workshops-search-suggestions">
              <h4 className="workshops-search-suggestions-title">💡 Sugerencias de búsqueda:</h4>
              <div className="workshops-search-suggestions-grid">
                {['pasta fresca', 'sushi básico', 'pan artesanal', 'postres franceses', 'cocina vegana'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchTerm(suggestion)}
                    className="workshops-search-suggestion"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkshopsSearch;