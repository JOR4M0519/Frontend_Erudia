import React, { useState, useEffect } from "react";
import { 
  ChevronDown, ChevronUp, Search, Filter, Users, Book, User, Calendar, 
  School, BookOpen, Check, X, Info, FileText, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { configurationService, LevelAccordion} from "../";
import SubjectsModal from "../modals/SubjectModal";




const StudentsGroupsTab = () => {
  const [groups, setGroups] = useState([]);
  const [levels, setLevels] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [groupedByLevel, setGroupedByLevel] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSubjects, setGroupSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Cargar períodos
        const periodsData = await configurationService.getPeriods();
        setPeriods(periodsData);
        
        // Cargar niveles educativos
        const levelsData = await configurationService.getEducationalLevels();
        setLevels(levelsData);
        
        // Cargar grupos
        const groupsData = await configurationService.getAllGroups();
        setGroups(groupsData);
        setFilteredGroups(groupsData);
        
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
        setError("No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.");
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Agrupar por nivel cuando cambian los grupos filtrados
  useEffect(() => {
    const groupByLevel = () => {
      const grouped = {};
      
      filteredGroups.forEach(group => {
        const levelId = group.level.id;
        if (!grouped[levelId]) {
          grouped[levelId] = {
            level: group.level,
            groups: []
          };
        }
        grouped[levelId].groups.push(group);
      });
      
      setGroupedByLevel(grouped);
    };
    
    groupByLevel();
  }, [filteredGroups]);

  // Aplicar filtros cuando cambian los criterios
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...groups];
      
      // Filtrar por nivel si está seleccionado
      if (selectedLevel) {
        filtered = filtered.filter(group => group.level.id === parseInt(selectedLevel));
      }
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          group => 
            group.groupName.toLowerCase().includes(term) || 
            group.groupCode.toLowerCase().includes(term) ||
            group.mentor.firstName.toLowerCase().includes(term) ||
            group.mentor.lastName.toLowerCase().includes(term)
        );
      }
      
      setFilteredGroups(filtered);
    };
    
    applyFilters();
  }, [groups, selectedLevel, searchTerm]);

  // Manejar clic en un grupo para mostrar sus materias
  const handleGroupClick = async (group) => {
    if (!selectedPeriod) {
      // Mostrar mensaje de que se debe seleccionar un período
      return;
    }
    
    try {
      setLoadingSubjects(true);
      setSelectedGroup(group);
      
      // Cargar materias del grupo para el período seleccionado
      const subjectsData = await configurationService.getSubjectsByGroupAndLevel(
        selectedPeriod,
        group.level.id
      );
      
      // Filtrar solo las materias de este grupo específico
      const groupSubjects = subjectsData.filter(
        item => item.groups && item.groups.id === group.id
      );
      
      setGroupSubjects(groupSubjects);
      setModalOpen(true);
      setLoadingSubjects(false);
    } catch (err) {
      console.error("Error al cargar materias del grupo:", err);
      setLoadingSubjects(false);
      // Mostrar mensaje de error
    }
  };

  // Manejar cambio de período
  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  // Manejar cambio de nivel
  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
  };

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Resetear filtros
  const resetFilters = () => {
    setSelectedLevel("");
    setSearchTerm("");
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Grupos y Materias</h2>
        <p className="mt-1 text-sm text-gray-600">
          Administra los grupos y visualiza las materias asociadas a cada uno.
        </p>
      </div>

      {/* Filtros */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período Académico *
            </label>
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              required
            >
              <option value="">Seleccione un período</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
            {!selectedPeriod && (
              <p className="mt-1 text-xs text-amber-600">
                <Info size={12} className="inline mr-1" />
                Seleccione un período para ver las materias de los grupos
              </p>
            )}
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel Educativo
            </label>
            <select
              value={selectedLevel}
              onChange={handleLevelChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            >
              <option value="">Todos los niveles</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.levelName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre, código..."
                className="w-full pl-10 border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              />
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 flex items-center text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw size={16} className="mr-2" />
              Resetear
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-gray-600">Cargando grupos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No se encontraron grupos</p>
            <p className="mt-1">Intente con otros filtros o cree nuevos grupos</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Mostrando {filteredGroups.length} de {groups.length} grupos
              </p>
            </div>
            
            {/* Acordeones por nivel */}
            {Object.values(groupedByLevel).map(({ level, groups }) => (
              <LevelAccordion
                key={level.id} 
                level={level} 
                groups={groups}
                selectedPeriod={selectedPeriod}
                onGroupClick={handleGroupClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para mostrar materias */}
      <AnimatePresence>
        {modalOpen && selectedGroup && (
          <SubjectsModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            group={selectedGroup}
            subjects={groupSubjects}
          />
        )}
      </AnimatePresence>

      {/* Modal de carga de materias */}
      {loadingSubjects && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mr-4"></div>
              <p>Cargando materias...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsGroupsTab;
