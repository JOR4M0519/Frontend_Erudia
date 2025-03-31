import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Search } from "lucide-react";

const AssociationsTab = ({ 
  subjectKnowledges, 
  allKnowledges, 
  uniqueSubjects,
  showFilters
}) => {
  // Estados para filtros
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [knowledgeFilter, setKnowledgeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Estado para asociaciones agrupadas por materia
  const [groupedAssociations, setGroupedAssociations] = useState({});
  
  // Estado para controlar qué materias están expandidas
  const [expandedSubjects, setExpandedSubjects] = useState({});

  // Agrupar asociaciones por materia cuando cambian los filtros
  useEffect(() => {
    groupAssociationsBySubject();
  }, [subjectKnowledges, subjectSearchTerm, knowledgeFilter, statusFilter]);

  // Agrupar asociaciones por materia
  const groupAssociationsBySubject = () => {
    const filteredAssociations = getFilteredSubjectKnowledges();
    const grouped = {};
    
    filteredAssociations.forEach(item => {
      const subjectId = item.idSubject.id;
      
      if (!grouped[subjectId]) {
        grouped[subjectId] = {
          subject: item.idSubject,
          knowledges: []
        };
      }
      
      // Verificar si el saber ya existe en el array
      const existingKnowledge = grouped[subjectId].knowledges.find(
        k => k.id === item.idKnowledge.id
      );
      
      if (!existingKnowledge) {
        grouped[subjectId].knowledges.push({
          id: item.idKnowledge.id,
          name: item.idKnowledge.name,
          percentage: item.idKnowledge.percentage,
          status: item.idKnowledge.status
        });
      }
    });
    
    setGroupedAssociations(grouped);
  };

  // Filtrar asociaciones de saberes con materias
  const getFilteredSubjectKnowledges = () => {
    return subjectKnowledges.filter(item => {
      const matchesSubject = subjectSearchTerm === "" || 
        item.idSubject.subjectName.toLowerCase().includes(subjectSearchTerm.toLowerCase());
      const matchesKnowledge = knowledgeFilter === "" || item.idKnowledge.id.toString() === knowledgeFilter;
      const matchesStatus = statusFilter === "" || item.idKnowledge.status === statusFilter;
      
      return matchesSubject && matchesKnowledge && matchesStatus;
    });
  };

  // Expandir/colapsar materia
  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // Resetear filtros
  const resetFilters = () => {
    setSubjectSearchTerm("");
    setKnowledgeFilter("");
    setStatusFilter("");
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
      {/* Filtros para asociaciones */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar materia
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={subjectSearchTerm}
                onChange={(e) => setSubjectSearchTerm(e.target.value)}
                placeholder="Nombre de la materia..."
                className="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saber
            </label>
            <select
              value={knowledgeFilter}
              onChange={(e) => setKnowledgeFilter(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los saberes</option>
              {allKnowledges.map((knowledge) => (
                <option key={knowledge.id} value={knowledge.id}>
                  {knowledge.name} ({knowledge.percentage}%)
                </option>
              ))}
            </select>
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
        </div>
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded transition-colors"
          >
            <X size={18} />
            Limpiar filtros
          </button>
        </div>
      </div>
      
      {/* Asociaciones agrupadas por materia (acordeón) */}
      {Object.keys(groupedAssociations).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No se encontraron asociaciones con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.values(groupedAssociations).map((group) => (
            <div key={group.subject.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Cabecera del acordeón */}
              <div 
                className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${
                  expandedSubjects[group.subject.id] ? "bg-amber-100" : "hover:bg-gray-50"
                }`}
                onClick={() => toggleSubject(group.subject.id)}
              >
                <div className="flex items-center">
                  <h3 className="font-medium text-lg">{group.subject.subjectName}</h3>
                  <span className="ml-2 text-sm text-gray-500">
                    {group.knowledges.length} saberes asociados
                  </span>
                </div>
                <div>
                  {expandedSubjects[group.subject.id] ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
              
              {/* Contenido del acordeón */}
              {expandedSubjects[group.subject.id] && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Saber
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Porcentaje
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.knowledges.map((knowledge) => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AssociationsTab;
