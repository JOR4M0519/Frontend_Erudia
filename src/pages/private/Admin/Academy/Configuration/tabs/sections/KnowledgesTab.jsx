import React, { useState, useEffect } from "react";
import { Edit, X } from "lucide-react";


const KnowledgesTab = ({ 
  allKnowledges,
  showFilters
}) => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Estado para saberes filtrados
  const [filteredKnowledges, setFilteredKnowledges] = useState([]);

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

  // Editar saber
  const handleEditKnowledge = (knowledge) => {
    // Aquí iría la lógica para editar el saber
    alert(`Editar saber: ${knowledge.name}`);
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
    <>
      {/* Filtros para saberes */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por nombre
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar saber..."
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={resetFilters}
                // KnowledgesTab.jsx (continuación)
                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded transition-colors"
              >
                <X size={18} />
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabla de saberes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-lg">Lista de saberes</h3>
          <p className="text-sm text-gray-500">{filteredKnowledges.length} saberes encontrados</p>
        </div>
        
        <div className="overflow-x-auto">
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKnowledges.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron saberes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredKnowledges.map((knowledge) => (
                  <tr key={knowledge.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {knowledge.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {knowledge.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {knowledge.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(knowledge.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleEditKnowledge(knowledge)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default KnowledgesTab;

