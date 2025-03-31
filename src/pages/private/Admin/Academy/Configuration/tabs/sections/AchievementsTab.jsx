import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Edit, X, Search, Filter } from "lucide-react";
import Swal from "sweetalert2";
import {configurationService} from "../../";

const AchievementsTab = ({ 
  periods, 
  levels, 
  allGroups,
  initialLoading,
  showFilters,
  setShowFilters
}) => {
  // Estados para datos
  const [knowledges, setKnowledges] = useState([]);
  
  // Estados para filtros principales
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  
  // Estados para filtros adicionales
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [dataFetched, setDataFetched] = useState(false);
  
  // Estructura para agrupar saberes por materia
  const [groupedKnowledges, setGroupedKnowledges] = useState({});

  // Filtrar grupos cuando cambia el nivel seleccionado
  useEffect(() => {
    if (selectedLevel) {
      const filtered = allGroups.filter(group => group.level.id === parseInt(selectedLevel));
      setFilteredGroups(filtered);
      // Resetear el grupo seleccionado si no está en la lista filtrada
      if (selectedGroup && !filtered.some(group => group.id === parseInt(selectedGroup))) {
        setSelectedGroup("");
      }
    } else {
      setFilteredGroups([]);
      setSelectedGroup("");
    }
  }, [selectedLevel, allGroups]);

  // Agrupar saberes cuando cambian los datos o filtros
  useEffect(() => {
    if (knowledges.length > 0) {
      groupKnowledgesBySubject();
    } else {
      // Limpiar los datos cuando no hay resultados
      setGroupedKnowledges({});
    }
  }, [knowledges, searchTerm, statusFilter]);

  // Buscar saberes según los filtros seleccionados
  const fetchKnowledges = async () => {
    if (!selectedPeriod || !selectedGroup) {
      return;
    }
    
    try {
      setLoading(true);
      const data = await configurationService.getAchievementGroupsKnowledge(
        selectedPeriod,
        selectedGroup
      );
      
      if (data && data.length > 0) {
        setKnowledges(data);
      } else {
        // Limpiar los datos cuando no hay resultados
        setKnowledges([]);
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron saberes para los filtros seleccionados'
        });
      }
      setDataFetched(true);
    } catch (error) {
      console.error("Error al obtener saberes:", error);
      // Limpiar los datos cuando hay un error
      setKnowledges([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los saberes'
      });
    } finally {
      setLoading(false);
    }
  };

  // Agrupar saberes por materia
  const groupKnowledgesBySubject = () => {
    const grouped = {};
    
    // Filtrar por término de búsqueda y estado
    const filteredKnowledges = knowledges.filter(item => {
      const knowledge = item.subjectKnowledge.idKnowledge;
      const matchesSearch = searchTerm === "" || 
        knowledge.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "" || knowledge.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Agrupar por materia
    filteredKnowledges.forEach(item => {
      const subject = item.subjectKnowledge.idSubject;
      const subjectId = subject.id;
      
      if (!grouped[subjectId]) {
        grouped[subjectId] = {
          subject: subject,
          knowledges: []
        };
      }
      
      // Verificar si el saber ya existe en el array
      const existingKnowledge = grouped[subjectId].knowledges.find(
        k => k.id === item.subjectKnowledge.idKnowledge.id
      );
      
      if (!existingKnowledge) {
        grouped[subjectId].knowledges.push({
          id: item.subjectKnowledge.idKnowledge.id,
          name: item.subjectKnowledge.idKnowledge.name,
          percentage: item.subjectKnowledge.idKnowledge.percentage,
          status: item.subjectKnowledge.idKnowledge.status,
          subjectId: subject.id,
          subjectName: subject.subjectName,
          achievements: [{
            id: item.id,
            text: item.achievement,
            groupName: item.group.groupName,
            periodName: item.period.name
          }]
        });
      } else {
        // Si el saber ya existe, solo añadimos el logro
        existingKnowledge.achievements.push({
          id: item.id,
          text: item.achievement,
          groupName: item.group.groupName,
          periodName: item.period.name
        });
      }
    });
    
    setGroupedKnowledges(grouped);
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
    setSearchTerm("");
    setStatusFilter("");
  };

  // Manejadores de cambios en filtros principales
  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
    setDataFetched(false);
    // Limpiar datos cuando se cambia el filtro
    setKnowledges([]);
    setGroupedKnowledges({});
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    setSelectedGroup("");
    setDataFetched(false);
    // Limpiar datos cuando se cambia el filtro
    setKnowledges([]);
    setGroupedKnowledges({});
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    setDataFetched(false);
    // Limpiar datos cuando se cambia el filtro
    setKnowledges([]);
    setGroupedKnowledges({});
  };

  // Editar saber
  const handleEditKnowledge = (knowledge) => {
    Swal.fire({
      title: 'Editar saber',
      text: `Editando saber: ${knowledge.name}`,
      icon: 'info'
    });
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
      {/* Filtros principales para logros y saberes */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        {initialLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={selectedPeriod}
                onChange={handlePeriodChange}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un período</option>
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel educativo
              </label>
              <select
                value={selectedLevel}
                onChange={handleLevelChange}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un nivel</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.levelName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo
              </label>
              <select
                value={selectedGroup}
                onChange={handleGroupChange}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedLevel}
              >
                <option value="">Seleccione un grupo</option>
                {filteredGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.groupName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchKnowledges}
                disabled={!selectedPeriod || !selectedGroup}
                className={`flex items-center gap-2 py-2 px-4 rounded transition-colors ${
                  !selectedPeriod || !selectedGroup
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                <Search size={18} />
                Buscar
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Filtros adicionales */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col flex-grow md:flex-grow-0">
              <label className="text-sm text-gray-600 mb-1">Buscar por nombre</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar saber..."
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
              <X size={18} />
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
      
      {/* Contenido de logros y saberes */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {dataFetched && Object.keys(groupedKnowledges).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No se encontraron saberes con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.values(groupedKnowledges).map((item) => (
                <div key={item.subject.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div 
                    className={`p-4 flex justify-between items-center cursor-pointer ${
                      expandedSubjects[item.subject.id] ? "bg-amber-100" : ""
                    }`}
                    onClick={() => toggleSubject(item.subject.id)}
                  >
                    <div className="flex items-center">
                      {expandedSubjects[item.subject.id] ? (
                        <ChevronUp className="h-5 w-5 mr-2 text-amber-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 mr-2 text-gray-500" />
                      )}
                      <h3 className="font-semibold">{item.subject.subjectName}</h3>
                      <span className="ml-2 text-sm text-gray-500">
                        {item.knowledges.length} saberes
                      </span>
                    </div>
                  </div>
                  
                  {expandedSubjects[item.subject.id] && (
                    <div className="p-4 bg-gray-50">
                      <div className="space-y-4">
                        {item.knowledges.map((knowledge) => (
                          <div key={knowledge.id} className="bg-white p-4 rounded-md border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <h4 className="font-semibold">{knowledge.name}</h4>
                                <span className="ml-2 text-sm text-gray-500">
                                  {knowledge.percentage}%
                                </span>
                                <span className="ml-2">
                                  {getStatusBadge(knowledge.status)}
                                </span>
                              </div>
                              <button
                                onClick={() => handleEditKnowledge(knowledge)}
                                className="p-1 text-gray-500 hover:text-amber-500"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="mt-2">
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Logros asociados:</h5>
                              <ul className="list-disc pl-5 space-y-1">
                                {knowledge.achievements.map((achievement) => (
                                  <li key={achievement.id} className="text-sm text-gray-600">
                                    {achievement.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default AchievementsTab;
