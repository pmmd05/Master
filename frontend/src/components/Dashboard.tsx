import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hola, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Perfil del usuario */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Tu Perfil</h3>
              <div className="mt-3">
                <div className="text-sm text-gray-500">
                  <p><strong>Nombre:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Talleres disponibles */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Talleres</h3>
              <div className="mt-3">
                <p className="text-sm text-gray-500">
                  Explora y reserva talleres de cocina disponibles.
                </p>
                <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Ver Talleres
                </button>
              </div>
            </div>
          </div>

          {/* Mis reservas */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Mis Reservas</h3>
              <div className="mt-3">
                <p className="text-sm text-gray-500">
                  Administra tus reservas de talleres.
                </p>
                <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                  Ver Reservas
                </button>
              </div>
            </div>
          </div>

          {/* Historial de pagos */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Pagos</h3>
              <div className="mt-3">
                <p className="text-sm text-gray-500">
                  Revisa tu historial de pagos y facturas.
                </p>
                <button className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
                  Ver Pagos
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Estadísticas</h3>
              <div className="mt-3">
                <div className="text-sm text-gray-500">
                  <p>Talleres completados: <span className="font-semibold">0</span></p>
                  <p>Próximos talleres: <span className="font-semibold">0</span></p>
                  <p>Total invertido: <span className="font-semibold">$0</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Acciones Rápidas</h3>
              <div className="mt-3 space-y-2">
                <button className="w-full text-left bg-gray-50 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                  Buscar talleres
                </button>
                <button className="w-full text-left bg-gray-50 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                  Editar perfil
                </button>
                <button className="w-full text-left bg-gray-50 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                  Soporte
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de bienvenida */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                ¡Bienvenido a MasterCook!
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Has iniciado sesión exitosamente. Desde aquí puedes explorar talleres de cocina,
                  hacer reservas y gestionar tus pagos. ¡Comienza tu aventura culinaria!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;