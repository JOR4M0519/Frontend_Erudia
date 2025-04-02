import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Edit, X, Search, Filter, Plus, ArrowLeft, Save, Check } from "lucide-react";
import Swal from "sweetalert2";
import { configurationService } from "../../";
import { motion, AnimatePresence } from "framer-motion";


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

  // Estados para edición
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [achievementText, setAchievementText] = useState("");

  // Estados para la creación de logros
  const [creationMode, setCreationMode] = useState(false);
  const [creationStep, setCreationStep] = useState(1); // 1: Selección de periodo, 2: Selección de grupo, 3: Selección de materia, 4: Confirmación
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [existingAchievements, setExistingAchievements] = useState([]);
  const [subjectKnowledges, setSubjectKnowledges] = useState([]);
  
  // Estados para la selección en el modo de creación
  const [newPeriodId, setNewPeriodId] = useState("");
  const [newGroupId, setNewGroupId] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [selectedProfessorName, setSelectedProfessorName] = useState("");

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

// Definir las variantes de animación
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Animaciones para elementos individuales
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
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

  // Iniciar edición de un logro
  const handleEditAchievement = (achievement) => {
    setEditingAchievement(achievement);
    setAchievementText(achievement.text);
  };

  const handleSaveAchievement = async () => {
    if (!editingAchievement || !achievementText.trim()) {
      return;
    }
  
    try {
      setLoading(true);
      
  // Encontrar el objeto de conocimiento correspondiente al logro que estamos editando
  const achievementData = knowledges.find(item => item.id === editingAchievement.id);
    
  if (!achievementData) {
    throw new Error("No se pudo encontrar el logro a editar");
  }

  // Construir objeto con la estructura correcta
  const updateData = {
    id: editingAchievement.id,
    subjectKnowledge: {id: achievementData.subjectKnowledge.id},
    group: {id: parseInt(selectedGroup)},
    period: {id: parseInt(selectedPeriod)},
    achievement: achievementText.trim()
  };

          


  await configurationService.updateAchievementGroupsKnowledge(
    editingAchievement.id,
    updateData
  );
  
      // Actualizar datos locales
      const updatedKnowledges = knowledges.map(item => {
        if (item.id === editingAchievement.id) {
          return {
            ...item,
            achievement: achievementText.trim()
          };
        }
        return item;
      });
  
      setKnowledges(updatedKnowledges);
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Logro actualizado',
        text: 'El logro se ha actualizado correctamente',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
  
      // Limpiar estado de edición
      setEditingAchievement(null);
      setAchievementText("");
      
    } catch (error) {
      console.error("Error al actualizar el logro:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el logro'
      });
    } finally {
      setLoading(false);
    }
  };
  

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingAchievement(null);
    setAchievementText("");
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

// función startCreationMode para que cargue los datos completos
const startCreationMode = async () => {
  try {
    setLoading(true);
    
    // Cargar los períodos independientemente del flujo que se tome
    const periodsData = await configurationService.getPeriods();
    setAvailablePeriods(periodsData);
    
    // Cargar grupos independientemente del flujo que se tome
    const groupsData = await configurationService.getAllGroups();
    setAvailableGroups(groupsData);
    
    // Usar el período y grupo ya seleccionados
    if (selectedPeriod && selectedGroup) {
      setNewPeriodId(selectedPeriod);
      setNewGroupId(selectedGroup);
      
      // Cargar directamente las materias disponibles
      const subjectsData = await configurationService.getAllSubjectGroupsByPeriodAndGroup(
        selectedPeriod,
        selectedGroup
      );
      setAvailableSubjects(subjectsData);
      
      // Avanzar directamente al paso de selección de materia
      setCreationMode(true);
      setCreationStep(3);
    } else {
      // Si no hay selección previa, seguir el flujo normal
      setCreationMode(true);
      setCreationStep(1);
    }
  } catch (error) {
    console.error("Error al iniciar modo de creación:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo iniciar el modo de creación'
    });
  } finally {
    setLoading(false);
  }
};


  // Manejar cambio de período en modo creación
  const handleNewPeriodChange = async (e) => {
    const periodId = e.target.value;
    setNewPeriodId(periodId);
    
    if (periodId) {
      try {
        setLoading(true);
        // Cargar grupos activos
        const groupsData = await configurationService.getAllGroups();
        setAvailableGroups(groupsData);
        // Avanzar al siguiente paso
        setCreationStep(2);
      } catch (error) {
        console.error("Error al cargar grupos:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los grupos'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Manejar cambio de grupo en modo creación
  const handleNewGroupChange = async (e) => {
    const groupId = e.target.value;
    setNewGroupId(groupId);
    
    if (groupId && newPeriodId) {
      try {
        setLoading(true);
        // Cargar materias disponibles para este grupo y período
        const subjectsData = await configurationService.getAllSubjectGroupsByPeriodAndGroup(
          newPeriodId,
          groupId
        );
        setAvailableSubjects(subjectsData);
        // Avanzar al siguiente paso
        setCreationStep(3);
      } catch (error) {
        console.error("Error al cargar materias:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las materias'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Manejar cambio de materia en modo creación
  const handleNewSubjectChange = async (e) => {
    const subjectProfessorGroupId = e.target.value;
    if (!subjectProfessorGroupId) return;
    
    // Encontrar el objeto completo de la materia seleccionada
    const selectedSubjectObj = availableSubjects.find(
      subject => subject.id.toString() === subjectProfessorGroupId
    );
    
    if (selectedSubjectObj) {
      const subjectId = selectedSubjectObj.subjectProfessor.subject.id;
      setNewSubjectId(subjectId);
      setSelectedSubjectName(selectedSubjectObj.subjectProfessor.subject.subjectName);
      setSelectedProfessorName(
        `${selectedSubjectObj.subjectProfessor.professor.firstName} ${selectedSubjectObj.subjectProfessor.professor.lastName}`
      );
      
      try {
        setLoading(true);
        
        // Obtener logros existentes para esta combinación
        const existingAchievementsData = await configurationService.getAllSubjectGroupsByPeriodAndSubjectAndGroup(
          newPeriodId,
          subjectId,
          newGroupId
        );
        setExistingAchievements(existingAchievementsData);
        
        // Obtener saberes asociados a esta materia
        const subjectKnowledgesData = await configurationService.getSubjectKnowledgeBySubject(subjectId);
        setSubjectKnowledges(subjectKnowledgesData);
        
        // Avanzar al siguiente paso
        setCreationStep(4);
      } catch (error) {
        console.error("Error al cargar datos de la materia:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos de la materia'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Verificar si un saber ya tiene un logro asociado
  const isKnowledgeWithAchievement = (knowledgeId) => {
    return existingAchievements.some(
      achievement => achievement.subjectKnowledge.idKnowledge.id === knowledgeId
    );
  };

  // Generar logros faltantes
  const generateMissingAchievements = async () => {
    try {
      setLoading(true);
      
      // Identificar saberes sin logros
      const missingKnowledges = subjectKnowledges.filter(
        sk => !isKnowledgeWithAchievement(sk.idKnowledge.id)
      );
      
      if (missingKnowledges.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Información',
          text: 'Todos los saberes ya tienen logros asociados'
        });
        return;
      }
      
      // Crear logros para cada saber faltante con texto simplificado
      const creationPromises = missingKnowledges.map(sk => {
        const newAchievement = {
          subjectKnowledge: {
            id: sk.id
          },
          achievement: "Logro", // Texto simplificado
          group: {
            id: parseInt(newGroupId)
          },
          period: {
            id: parseInt(newPeriodId)
          }
        };
        
        return configurationService.createAchievementGroupsKnowledge(newAchievement);
      });
      
      await Promise.all(creationPromises);
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Logros creados',
        text: `Se han creado ${missingKnowledges.length} logros correctamente`,
        confirmButtonText: 'Ver logros'
      }).then((result) => {
        if (result.isConfirmed) {
          // Salir del modo de creación y mostrar los logros creados
          setCreationMode(false);
          setSelectedPeriod(newPeriodId);
          setSelectedGroup(newGroupId);
          // Buscar los logros recién creados
          fetchKnowledges();
        }
      });
      
    } catch (error) {
      console.error("Error al generar logros:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron generar los logros'
      });
    } finally {
      setLoading(false);
    }
  };

  // Salir del modo de creación
  const exitCreationMode = () => {
    setCreationMode(false);
    setCreationStep(1);
    setNewPeriodId("");
    setNewGroupId("");
    setNewSubjectId("");
    setAvailablePeriods([]);
    setAvailableGroups([]);
    setAvailableSubjects([]);
    setExistingAchievements([]);
    setSubjectKnowledges([]);
  };

  // Renderizar el contenido según el modo actual
  const renderContent = () => {
    if (creationMode) {
      return renderCreationMode();
    } else {
      return renderViewMode();
    }
  };

  // Renderizar el modo de visualización normal
  const renderViewMode = () => {
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
                  {periods.map(period => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel
                </label>
                <select
                  value={selectedLevel}
                  onChange={handleLevelChange}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione un nivel</option>
                  {levels.map(level => (
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
                  {filteredGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col justify-end">
                <button
                  onClick={fetchKnowledges}
                  disabled={!selectedPeriod || !selectedGroup}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Buscar
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Acciones y filtros adicionales */}
        {dataFetched && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={startCreationMode}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                <Plus size={18} />
                Crear logros
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded transition-colors"
              >
                <Filter size={18} />
                {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </button>
            </div>
          </div>
        )}
        
        {/* Filtros adicionales */}
        {dataFetched && showFilters && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar saber
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre del saber..."
                    className="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
        )}
        
        {/* Lista de saberes agrupados por materia */}
        {dataFetched && Object.keys(groupedKnowledges).length > 0 ? (
          <div className="space-y-4">
            {Object.values(groupedKnowledges).map((group) => (
              <div key={group.subject.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Cabecera de la materia */}
                <div 
                  className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${
                    expandedSubjects[group.subject.id] ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleSubject(group.subject.id)}
                >
                  <h3 className="font-medium text-lg">{group.subject.subjectName}</h3>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-500">
                      {group.knowledges.length} saberes
                    </span>
                    {expandedSubjects[group.subject.id] ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
                
                {/* Contenido expandible */}
                {expandedSubjects[group.subject.id] && (
                  <div className="p-4 bg-gray-50">
                    <div className="space-y-4">
                      {group.knowledges.map((knowledge) => (
                        <div key={knowledge.id} className="bg-white rounded-lg shadow-sm p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-blue-700">{knowledge.name}</h4>
                              <div className="text-sm text-gray-500">
                                Porcentaje: {knowledge.percentage}%
                              </div>
                              <div className="mt-1">
                                {getStatusBadge(knowledge.status)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Logros asociados */}
                          <div className="mt-4 space-y-3">
                            <h5 className="font-medium text-gray-700 text-sm">Logros:</h5>
                            {knowledge.achievements.map((achievement) => (
  <div key={achievement.id} className="bg-gray-50 rounded-md p-3">
    <AnimatePresence mode="wait">
      {editingAchievement && editingAchievement.id === achievement.id ? (
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <textarea
            value={achievementText}
            onChange={(e) => setAchievementText(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <motion.button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={handleSaveAchievement}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={14} />
              Guardar
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="flex justify-between items-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div>
            <p className="text-gray-800">{achievement.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              {achievement.groupName} - {achievement.periodName}
            </p>
          </div>
          <motion.button
            onClick={() => handleEditAchievement(achievement)}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Editar logro"
            whileHover={{ scale: 1.2, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
          >
            <Edit size={16} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
))}

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : dataFetched ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No se encontraron logros para los filtros seleccionados.</p>
          </div>
        ) : null}
      </>
    );
  };

  const renderCreationMode = () => {
    return (
      <motion.div 
        className="bg-white rounded-lg shadow p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <motion.h2 
            className="text-xl font-medium text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {creationStep === 3 && "Seleccionar materia"}
            {creationStep === 4 && "Generar logros"}
          </motion.h2>
          <motion.button
            onClick={exitCreationMode}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <ArrowLeft size={18} />
            Volver
          </motion.button>
        </div>
  
        {/* Pasos de navegación */}
        <div className="mb-6">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <motion.div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step <= creationStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: step * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  {step < creationStep ? <Check size={16} /> : step}
                </motion.div>
                {step < 4 && (
                  <motion.div
                    className={`flex-1 h-1 mx-2 ${
                      step < creationStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: step * 0.1, duration: 0.3 }}
                  ></motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Período</span>
            <span>Grupo</span>
            <span>Materia</span>
            <span>Generar</span>
          </div>
        </div>
  
        {/* Contenido de los pasos con animaciones */}
        <AnimatePresence mode="wait">
          {/* Paso 3: Selección de materia */}
          {creationStep === 3 && (
            <motion.div 
              className="space-y-6"
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccione una materia
                </label>
                <select
                  value={newSubjectId}
                  onChange={handleNewSubjectChange}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione una materia</option>
                  {availableSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subjectProfessor.subject.subjectName} - Prof. {subject.subjectProfessor.professor.firstName} {subject.subjectProfessor.professor.lastName}
                    </option>
                  ))}
                </select>
              </motion.div>

            </motion.div>
          )}
  
          {/* Paso 4: Confirmación y generación */}
          {creationStep === 4 && (
            <motion.div 
              className="space-y-6"
              key="step4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div 
                className="bg-blue-50 border border-blue-200 rounded-md p-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="font-medium text-blue-800 mb-2">Resumen</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  {console.log(availablePeriods,availableGroups)}
                  <li><span className="font-medium">Período:</span> {availablePeriods.find(p => p.id.toString() === newPeriodId)?.name}</li>
                  <li><span className="font-medium">Grupo:</span> {availableGroups.find(g => g.id.toString() === newGroupId)?.groupName}</li>
                  <li><span className="font-medium">Materia:</span> {selectedSubjectName}</li>
                  <li><span className="font-medium">Profesor:</span> {selectedProfessorName}</li>
                </ul>
              </motion.div>
  
              <motion.div 
                className="bg-gray-50 border border-gray-200 rounded-md p-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Saberes disponibles</h3>
                  <span className="text-sm text-gray-500">
                    {subjectKnowledges.length} saberes encontrados
                  </span>
                </div>
  
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {subjectKnowledges.map((knowledge, index) => (
                    <motion.div 
                      key={knowledge.id} 
                      className={`p-3 rounded-md flex justify-between items-center ${
                        isKnowledgeWithAchievement(knowledge.idKnowledge.id)
                          ? "bg-green-50 border border-green-200"
                          : "bg-white border border-gray-200"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div>
                        <div className="font-medium">{knowledge.idKnowledge.name}</div>
                        <div className="text-sm text-gray-500">Porcentaje: {knowledge.idKnowledge.percentage}%</div>
                      </div>
                      {isKnowledgeWithAchievement(knowledge.idKnowledge.id) ? (
                        <motion.span 
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.05, type: "spring" }}
                        >
                          Logro existente
                        </motion.span>
                      ) : (
                        <motion.span 
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.05, type: "spring" }}
                        >
                          Pendiente
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>
  
                {subjectKnowledges.length === 0 && (
                  <motion.div 
                    className="text-center py-4 text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    No se encontraron saberes asociados a esta materia
                  </motion.div>
                )}
              </motion.div>
  
              <div className="flex justify-between">
                <motion.button
                  onClick={() => setCreationStep(3)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Anterior
                </motion.button>
                <motion.button
                  onClick={generateMissingAchievements}
                  disabled={subjectKnowledges.every(sk => isKnowledgeWithAchievement(sk.idKnowledge.id))}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                  whileHover={!subjectKnowledges.every(sk => isKnowledgeWithAchievement(sk.idKnowledge.id)) ? { scale: 1.05 } : {}}
                  whileTap={!subjectKnowledges.every(sk => isKnowledgeWithAchievement(sk.idKnowledge.id)) ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Generar logros faltantes
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };
  
  // Overlay de carga
  const loadingOverlay = loading && (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span>Procesando...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {renderContent()}
      {loadingOverlay}
    </div>
  );
};

export default AchievementsTab;

