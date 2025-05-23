// frontend/src/components/WorkshopsPage.tsx - VERSION REAL CON API
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { WorkshopsProvider } from '../context/WorkshopsContext';
import WorkshopsSearch from './WorkshopsSearch';
import WorkshopsList from './WorkshopsList';

const WorkshopsPageContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Explora Nuestros Talleres
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hola, <span className="font-medium">{user?.name}</span>
              </span>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información y bienvenida */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">
              ¡Hola {user?.name?.split(' ')[0]}! Descubre Experiencias Culinarias Únicas
            </h2>
            <p className="text-indigo-100 mb-4">
              Como miembro de nuestra comunidad, tienes acceso completo a todos nuestros talleres. 
              Desde pasta italiana hasta sushi japonés, encuentra el taller perfecto para expandir tus habilidades culinarias.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Instructores Expertos
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                </svg>
                Clases Prácticas
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                </svg>
                Ambiente Acogedor
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <WorkshopsSearch />

        {/* Lista de talleres */}
        <WorkshopsList />

        {/* Información adicional */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ¿Cómo funciona?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Elige tu Taller</h4>
              <p className="text-sm text-gray-600">
                Navega por nuestros talleres y encuentra el que más te interese
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Haz tu Reserva</h4>
              <p className="text-sm text-gray-600">
                Reserva tu cupo con un solo click. ¡Los cupos son limitados!
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Disfruta y Aprende</h4>
              <p className="text-sm text-gray-600">
                Asiste al taller y disfruta de una experiencia culinaria única
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional personalizada para usuarios autenticados */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-indigo-800 mb-2">
            ¡Todo listo para reservar!
          </h3>
          <p className="text-indigo-700 mb-4">
            Como usuario registrado, puedes reservar cualquier taller disponible con un solo click. 
            Recuerda revisar tus reservas en el dashboard.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => window.location.href = '/bookings'}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Ver Mis Reservas
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-white text-indigo-600 px-4 py-2 rounded-md border border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal que provee el contexto
const WorkshopsPage: React.FC = () => {
  return (
    <WorkshopsProvider>
      <WorkshopsPageContent />
    </WorkshopsProvider>
  );
};

export default WorkshopsPage;