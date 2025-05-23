// frontend/src/context/WorkshopsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workshop } from '../types';
import { workshopsService } from '../services/api';

interface WorkshopsContextType {
  workshops: Workshop[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: string;
  filteredWorkshops: Workshop[];
  loadWorkshops: () => Promise<void>;
  searchWorkshops: (categoria?: string, palabra?: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  refreshWorkshops: () => Promise<void>;
}

const WorkshopsContext = createContext<WorkshopsContextType | undefined>(undefined);

interface WorkshopsProviderProps {
  children: ReactNode;
}

export const WorkshopsProvider: React.FC<WorkshopsProviderProps> = ({ children }) => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Cargar talleres iniciales
  const loadWorkshops = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [WORKSHOPS] Cargando talleres...');
      
      const workshopsData = await workshopsService.getAllWorkshops();
      setWorkshops(workshopsData);
      console.log(`✅ [WORKSHOPS] ${workshopsData.length} talleres cargados:`, workshopsData);
    } catch (err: any) {
      console.error('❌ [WORKSHOPS] Error cargando talleres:', err);
      setError(err.message || 'Error al cargar talleres');
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar talleres con filtros
  const searchWorkshops = async (categoria?: string, palabra?: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [WORKSHOPS] Buscando talleres:', { categoria, palabra });
      
      const workshopsData = await workshopsService.searchWorkshops(categoria, palabra);
      setWorkshops(workshopsData);
      console.log(`✅ [WORKSHOPS] ${workshopsData.length} talleres encontrados`);
    } catch (err: any) {
      console.error('❌ [WORKSHOPS] Error en búsqueda:', err);
      setError(err.message || 'Error en la búsqueda');
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  // Refrescar talleres
  const refreshWorkshops = async () => {
    if (searchTerm || selectedCategory) {
      await searchWorkshops(
        selectedCategory || undefined, 
        searchTerm || undefined
      );
    } else {
      await loadWorkshops();
    }
  };

  // Filtrar talleres localmente
  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = searchTerm === '' || 
      workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === '' || 
      workshop.category === selectedCategory;
      
    return matchesSearch && matchesCategory;
  });

  // Cargar talleres al montar el componente
  useEffect(() => {
    loadWorkshops();
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || selectedCategory) {
        searchWorkshops(
          selectedCategory || undefined,
          searchTerm || undefined
        );
      } else {
        loadWorkshops();
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  const value: WorkshopsContextType = {
    workshops,
    loading,
    error,
    searchTerm,
    selectedCategory,
    filteredWorkshops,
    loadWorkshops,
    searchWorkshops,
    setSearchTerm,
    setSelectedCategory,
    refreshWorkshops,
  };

  return (
    <WorkshopsContext.Provider value={value}>
      {children}
    </WorkshopsContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useWorkshops = (): WorkshopsContextType => {
  const context = useContext(WorkshopsContext);
  if (context === undefined) {
    throw new Error('useWorkshops debe ser usado dentro de un WorkshopsProvider');
  }
  return context;
};