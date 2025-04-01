import React, { useState, useEffect } from "react";
import { Edit, Trash2, X, Plus, Search } from "lucide-react";
import {configurationService,KnowledgeModal} from "../../";
import Swal from "sweetalert2";


const KnowledgesTab = ({ 
  allKnowledges,
  showFilters,
  onKnowledgeUpdated
}) => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Estado para saberes filtrados
  const [filteredKnowledges, setFilteredKnowledges] = useState([]);
  
  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [currentKnowledge, setCurrentKnowledge] = useState(null);

  // Filtrar saberes cuando cambian los filtros
  useEffect(() => {
    filterKnowledges();
  }, [allKnowledges, searchTerm, statusFilter]);

  // Filtrar saberes
  const filterKnowledges = () => {
    const filtered = allKnowledges.filter(knowledge => {
      const matchesSearch = searchTerm === "" || 
        knowledge.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "" || knowledge.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredKnowledges(filtered);
  };

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  // Abrir modal para crear nuevo saber
  const handleAddKnowledge = () => {
    setCurrentKnowledge(null);
    setShowModal(true);
  };

  // Editar saber
  const handleEditKnowledge = (knowledge) => {
    setCurrentKnowledge(knowledge);
    setShowModal(true);
  };

  // Eliminar saber
  const handleDeleteKnowledge = async (id, name) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar el saber "${name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await configurationService.deleteKnowledges(id);
        
        // Notificar al componente padre para actualizar la lista
        if (onKnowledgeUpdated) {
          onKnowledgeUpdated();
        }
        
        Swal.fire(
          'Eliminado',
          'El saber ha sido eliminado correctamente',
          'success'
        );
      }
    } catch (error) {
      console.error("Error al eliminar saber:", error);
      
      if (error.response) {
        switch (error.response.status) {
          case 409: // Conflict
            Swal.fire({
              icon: 'warning',
              title: 'No se puede eliminar',
              text: error.response.data || 'Este saber está siendo utilizado en logros o evaluaciones'
            });
            break;
          case 404: // Not Found
            Swal.fire({
              icon: 'info',
              title: 'No encontrado',
              text: 'El saber no existe o ya ha sido eliminado'
            });
            break;
          default:
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el saber'
            });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el saber'
        });
      }
    }
  };

  // Guardar saber (crear o actualizar)
  const handleSaveKnowledge = async (knowledgeData) => {
    try {
      if (currentKnowledge) {
        // Actualizar saber existente
        await configurationService.updateKnowledges(currentKnowledge.id, knowledgeData);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Saber actualizado correctamente'
        });
      } else {
        // Crear nuevo saber
        await configurationService.createKnowledges(knowledgeData);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Saber creado correctamente'
        });
      }
      
      // Cerrar modal
      setShowModal(false);
      
      // Notificar al componente padre para actualizar la lista
      if (onKnowledgeUpdated) {
        onKnowledgeUpdated();
      }
    } catch (error) {
      console.error("Error al guardar saber:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el saber'
      });
    }
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    if (status === "A") {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Activo
        </span>
      );
    } else {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          Inactivo
        </span>
      );
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Saberes</h2>
        <button
          onClick={handleAddKnowledge}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-1" /> Nuevo Saber
        </button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="mb-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Buscar por nombre</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar saber..."
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
        </div>
      )}

      {/* Tabla de saberes */}
      {filteredKnowledges.length > 0 ? (
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
                  Porcentaje
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
              {filteredKnowledges.map((knowledge) => (
                <tr key={knowledge.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {knowledge.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {knowledge.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {knowledge.percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(knowledge.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditKnowledge(knowledge)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteKnowledge(knowledge.id, knowledge.name)}
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
          <p className="text-gray-600">No se encontraron saberes.</p>
        </div>
      )}

      {/* Modal para crear/editar saber */}
      {showModal && (
        <KnowledgeModal
          knowledge={currentKnowledge}
          onSave={handleSaveKnowledge}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default KnowledgesTab;
