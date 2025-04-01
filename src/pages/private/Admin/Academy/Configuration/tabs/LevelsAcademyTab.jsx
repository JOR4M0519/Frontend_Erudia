import React, { useState, useEffect } from "react";
import { configurationService, LevelModal } from "../";
import Swal from "sweetalert2";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";

const LevelsAcademyTap = () => {
  const [levels, setLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Cambiado de showForm a showModal
  const [currentLevel, setCurrentLevel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Cargar niveles al montar el componente
  useEffect(() => {
    fetchLevels();
  }, []);

  // Filtrar niveles cuando cambian los filtros
  useEffect(() => {
    applyFilters();
  }, [levels, searchTerm, statusFilter]);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const data = await configurationService.getEducationalLevels();
      setLevels(data);
      setFilteredLevels(data);
    } catch (error) {
      console.error("Error al cargar niveles académicos:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los niveles académicos'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...levels];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(level => 
        level.levelName.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado
    if (statusFilter) {
      result = result.filter(level => level.status === statusFilter);
    }
    
    setFilteredLevels(result);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  const handleAddClick = () => {
    setCurrentLevel(null);
    setShowModal(true);
  };

  const handleEditClick = (level) => {
    setCurrentLevel(level);
    setShowModal(true);
  };

  const handleDeleteClick = async (id, levelName) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar el nivel "${levelName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await configurationService.deleteEducationalLevel(id);
        await fetchLevels();
        Swal.fire(
          'Eliminado',
          'El nivel académico ha sido eliminado',
          'success'
        );
      }
    } catch (error) {
      console.error("Error al eliminar nivel académico:", error);
      
      if (error.response) {
        switch (error.response.status) {
          case 409: // Conflict (IM_USED)
            Swal.fire({
              icon: 'warning',
              title: 'No se puede eliminar',
              text: error.response.data || 'Este nivel educativo está siendo utilizado por grupos o esquemas de calificación.'
            });
            break;
          case 404: // Not Found
            Swal.fire({
              icon: 'info',
              title: 'No encontrado',
              text: 'El nivel educativo no existe o ya ha sido eliminado.'
            });
            break;
          default:
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el nivel académico'
            });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el nivel académico'
        });
      }
    }
  };

  const handleSaveLevel = async (levelData) => {
    try {
      if (currentLevel) {
        // Actualizar nivel existente
        await configurationService.updateEducationalLevel(currentLevel.id, levelData);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Nivel académico actualizado correctamente'
        });
      } else {
        // Crear nuevo nivel
        await configurationService.createEducationalLevel(levelData);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Nivel académico creado correctamente'
        });
      }
      
      await fetchLevels();
      setShowModal(false);
    } catch (error) {
      console.error("Error al guardar nivel académico:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el nivel académico'
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const getStatusLabel = (status) => {
    return status === 'A' ? 'Activo' : 'Inactivo';
  };

  const getStatusClass = (status) => {
    return status === 'A' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Niveles Académicos</h2>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-1" /> Nuevo Nivel
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Filtros</h3>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Buscar por nombre</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar nivel..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center"
              >
                <X size={18} className="mr-1" /> Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de niveles */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando niveles académicos...</p>
        </div>
      ) : filteredLevels.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLevels.map((level) => (
                <tr key={level.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {level.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {level.levelName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusClass(level.status)}`}>
                      {getStatusLabel(level.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(level)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(level.id, level.levelName)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">No se encontraron niveles académicos.</p>
        </div>
      )}

      {/* Modal para crear/editar nivel */}
      {showModal && (
        <LevelModal
          level={currentLevel}
          onSave={handleSaveLevel}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default LevelsAcademyTap;
