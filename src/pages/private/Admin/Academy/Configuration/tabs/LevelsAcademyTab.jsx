import React, { useState, useEffect } from "react";
import { configurationService, LevelForm } from "../";
import Swal from "sweetalert2";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";

const LevelsAcademyTap = () => {
  const [levels, setLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
    setShowForm(true);
  };

  const handleEditClick = (level) => {
    setCurrentLevel(level);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede revertir",
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el nivel académico'
      });
    }
  };

  const handleSaveLevel = async (levelData) => {
    try {
      if (currentLevel) {
        // Actualizar nivel existente
        await configurationService.updateEducationalLevel(currentLevel.id, levelData);
      } else {
        // Crear nuevo nivel
        await configurationService.createEducationalLevel(levelData);
      }
      
      await fetchLevels();
      setShowForm(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: currentLevel 
          ? 'Nivel académico actualizado correctamente' 
          : 'Nivel académico creado correctamente'
      });
    } catch (error) {
      console.error("Error al guardar nivel académico:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el nivel académico'
      });
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold">Niveles académicos</h2>
          <p className="text-sm text-gray-600 mt-2">
            Total: {loading ? "..." : filteredLevels.length} de {levels.length} niveles
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          >
            <Search size={18} />
            {showFilters ? "Ocultar filtros" : "Buscar y filtrar"}
          </button>
          
          {!showForm && (
            <button
              onClick={handleAddClick}
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded inline-flex items-center transition-colors"
            >
              <Plus size={18} className="mr-1" />
              Agregar nivel académico
            </button>
          )}
        </div>
      </div>
      
      {/* Sección de filtros */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col flex-grow md:flex-grow-0">
              <label className="text-sm text-gray-600 mb-1">Buscar por nombre</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar nivel..."
                className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
            
            <button 
              onClick={resetFilters}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded transition-colors"
            >
              <X size={16} />
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-2/3">
                  Niveles académicos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLevels.map((level) => (
                <tr key={level.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {level.levelName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {level.status === 'A' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleEditClick(level)}
                      className="text-gray-600 hover:text-blue-700 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 mr-2 transition-colors"
                    >
                      <span className="flex items-center">
                        <Edit size={14} className="mr-1" />
                        Editar
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(level.id)}
                      className="text-gray-600 hover:text-red-700 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 transition-colors"
                    >
                      <span className="flex items-center">
                        <Trash2 size={14} className="mr-1" />
                        Eliminar
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLevels.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    {levels.length === 0 ? 
                      "No hay niveles académicos registrados" : 
                      "No se encontraron niveles que coincidan con los filtros aplicados"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        {showForm && (
          <LevelForm
            level={currentLevel}
            onSave={handleSaveLevel}
            onCancel={handleCancelForm}
          />
        )}
      </div>
    </div>
  );
};

export default LevelsAcademyTap;
