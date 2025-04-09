import React, { useState, useEffect } from "react";
import { 
  ChevronDown, ChevronUp, Search, Filter, Users, Book, User, Calendar, 
  School, BookOpen, Check, X, Info, FileText, RefreshCw, Plus, UserPlus,
  Trash2, Edit, Eye, Grid, List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { configurationService,
  LevelAccordion,
  CreateGroupModal,
  AssignSubjectModal,
  CreateSubjectModal,
  AssignProfessorModal,
  SubjectsModal,
  SubjectProfessorsTab,
  EditGroupModal
} from "../";
const StudentsGroupsTab = () => {
  // Estados para datos
  const [levels, setLevels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectProfessors, setSubjectProfessors] = useState([]);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const currentYear = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [availableYears, setAvailableYears] = useState(() => {
    return [currentYear-2, currentYear-1, currentYear, currentYear+1, currentYear+2];
  });
  
  // Estados para modales
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreateSubjectModal, setShowCreateSubjectModal] = useState(false);
  const [showAssignSubjectModal, setShowAssignSubjectModal] = useState(false);
  const [showAssignProfessorModal, setShowAssignProfessorModal] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);

  // Estado para carga inicial
  const [loading, setLoading] = useState(true);
  
  // Estado para pestañas
  const [activeTab, setActiveTab] = useState("groups"); // "groups" o "subjects"
  
  // Estado para modo de edición
  const [editMode, setEditMode] = useState(false);

  // Referencia para el selector de periodos
  const periodSelectorRef = React.useRef(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [levelsData, groupsData, professorsData, subjectsData, subjectProfessorsData] = await Promise.all([
          configurationService.getEducationalLevels(),
          configurationService.getAllGroups(),
          configurationService.getAdministrativeUsers(),
          configurationService.getSubjects(),
          configurationService.getSubjectProfessors()
        ]);
        
        setLevels(levelsData);
        setGroups(groupsData);
        setProfessors(professorsData);
        setSubjects(subjectsData);
        setSubjectProfessors(subjectProfessorsData);
        
        // // Generar años (últimos 5 años)
        // const currentYear = new Date().getFullYear();
        // const years = Array.from({length: 5}, (_, i) => currentYear - i);
        // setAvailableYears(years);
        
        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los datos iniciales",
        });
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Cargar periodos cuando cambia el año seleccionado
  useEffect(() => {
    const loadPeriods = async () => {
      if (!yearFilter) {
        setPeriods([]);
        setPeriodFilter("");
        return;
      }
      
      try {
        const periodsData = await configurationService.getPeriodsByYear(yearFilter);
        setPeriods(periodsData);
        setPeriodFilter(""); // Resetear el periodo seleccionado cuando cambia el año
      } catch (error) {
        console.error("Error cargando periodos por año:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los periodos para el año seleccionado",
        });
      }
    };
    
    loadPeriods();
  }, [yearFilter]);

  // Filtrar grupos según los filtros aplicados
  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         group.groupCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter ? group.level.id === parseInt(levelFilter) : true;
    
    return matchesSearch && matchesLevel;
  });


  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setShowEditGroupModal(true);
  };

  const handleGroupUpdated = async (groupId, groupData) => {
    try {
      // Actualizar el grupo en el backend
      let updatedGroup = await configurationService.updateGroups(groupId, groupData);
      
      // Si el grupo tiene mentor pero la información está incompleta
      if (updatedGroup.mentor && (!updatedGroup.mentor.firstName || !updatedGroup.mentor.lastName)) {
        try {
          // Obtener todos los grupos para asegurar que tenemos datos completos
          const allGroups = await configurationService.getAllGroups();
          
          // Encontrar el grupo recién actualizado con datos completos
          const completeGroup = allGroups.find(g => g.id === updatedGroup.id);
          
          if (completeGroup) {
            updatedGroup = completeGroup;
          }
        } catch (fetchError) {
          console.error("Error al obtener datos completos del grupo:", fetchError);
          // Continuamos con los datos que tenemos
        }
      }
      
      // Actualizar el estado local reemplazando el grupo editado
      setGroups(prevGroups => prevGroups.map(group => 
        group.id === groupId ? updatedGroup : group
      ));
      
      // Cerrar el modal
      setShowEditGroupModal(false);
      
      // Mostrar notificación
      Swal.fire({
        icon: "success",
        title: "Grupo actualizado",
        text: `El grupo ${updatedGroup.groupName} ha sido actualizado exitosamente`,
      });
    } catch (error) {
      console.error("Error al actualizar grupo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el grupo. Intente nuevamente."
      });
    }
  };

  // Agrupar los grupos por nivel educativo
  const groupedByLevel = filteredGroups.reduce((acc, group) => {
    const levelId = group.level.id;
    if (!acc[levelId]) {
      acc[levelId] = {
        level: group.level,
        groups: []
      };
    }
    acc[levelId].groups.push(group);
    return acc;
  }, {});

  // Manejadores para modales
  const handleCreateGroup = (levelId) => {
    const selectedLevel = levels.find(level => level.id === levelId);
    setSelectedLevel(selectedLevel);
    setShowCreateGroupModal(true);
  };


  const saveNewGroup = async (groupData) => {
    try {
      // Crear el grupo en el backend
      let newGroup = await configurationService.createGroups(groupData);
      
      // Si el grupo tiene mentor pero la información está incompleta
      if (newGroup.mentor && (!newGroup.mentor.firstName || !newGroup.mentor.lastName)) {
        try {
          // Obtener todos los grupos para asegurar que tenemos datos completos
          const allGroups = await configurationService.getAllGroups();
          
          // Encontrar el grupo recién creado con datos completos
          const completeGroup = allGroups.find(g => g.id === newGroup.id);
          
          if (completeGroup) {
            newGroup = completeGroup;
          }
        } catch (fetchError) {
          console.error("Error al obtener datos completos del grupo:", fetchError);
          // Continuamos con los datos que tenemos
        }
      }
      
      // Cerrar el modal (esto ocurre automáticamente por el onSave callback)
      setShowCreateGroupModal(false);
      
      // Actualizar el estado local añadiendo el nuevo grupo con datos completos
      setGroups(prevGroups => [...prevGroups, newGroup]);
      
      // Mostrar notificación con Swal
      Swal.fire({
        icon: "success",
        title: "Grupo creado",
        text: `El grupo ${newGroup.groupName} ha sido creado exitosamente`,
      });
      
      return newGroup;
    } catch (error) {
      console.error("Error al crear el grupo:", error);
      
      // Mostrar error con Swal
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el grupo. Intente nuevamente."
      });
      
      throw error;
    }
  };

  
  const handleAssignSubject = (group) => {
    if (!periodFilter) {
      Swal.fire({
        icon: "warning",
        title: "Seleccione un periodo",
        text: "Debe seleccionar un periodo académico para asignar materias",
      });
      
      // Scroll hacia el selector de periodo si está disponible
      if (periodSelectorRef.current) {
        periodSelectorRef.current.scrollIntoView({ behavior: 'smooth' });
        periodSelectorRef.current.focus();
      }
      return;
    }
    
    setSelectedGroup(group);
    setShowAssignSubjectModal(true);
  };

// Modifica la función handleViewSubjects para guardar las materias junto con el grupo
const handleViewSubjects = async (group) => {
  if (!periodFilter) {
    Swal.fire({
      icon: "warning",
      title: "Seleccione un periodo",
      text: "Debe seleccionar un periodo académico para ver las materias",
    });
    
    // Scroll hacia el selector de periodo si está disponible
    if (periodSelectorRef.current) {
      periodSelectorRef.current.scrollIntoView({ behavior: 'smooth' });
      periodSelectorRef.current.focus();
    }
    return;
  }
  
  try {
    setLoading(true);
    
    // Cargar materias del grupo para el período seleccionado
    const groupSubjectsData = await configurationService.getSubjectsByGroupAndLevel(
      periodFilter,
      group.level.id
    );
    
    // Filtrar solo las materias de este grupo específico
    const filteredGroupSubjects = groupSubjectsData.filter(
      item => item.groups && item.groups.id === group.id
    );
    
    // Guardar el grupo seleccionado con sus materias
    setSelectedGroup({...group, subjectsData: filteredGroupSubjects});
    setShowSubjectsModal(true);
    setLoading(false);
  } catch (error) {
    console.error("Error al cargar materias del grupo:", error);
    setLoading(false);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar las materias del grupo",
    });
  }
};

  const handleDeleteGroup = async (groupId) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará el grupo académico y no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await configurationService.deleteGroups(groupId);
        
        // Recargar grupos
        const updatedGroups = await configurationService.getAllGroups();
        setGroups(updatedGroups);
        
        Swal.fire(
          '¡Eliminado!',
          'El grupo académico ha sido eliminado correctamente.',
          'success'
        );
      }
    } catch (error) {
      console.error("Error al eliminar grupo:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el grupo. Puede que tenga estudiantes o materias asociadas.'
      });
    }
  };

  // Manejadores para acciones CRUD
  const handleGroupCreated = async (newGroup) => {
    try {
      setShowCreateGroupModal(false);
      
      // Agregar el nuevo grupo al estado directamente en lugar de recargar todos
      setGroups(prevGroups => [...prevGroups, newGroup]);
      
      Swal.fire({
        icon: "success",
        title: "Grupo creado",
        text: `El grupo ${newGroup.groupName} ha sido creado exitosamente`,
      });
    } catch (error) {
      console.error("Error al actualizar grupos:", error);
    }
  };

  const handleSubjectCreated = async (newSubject) => {
    try {
      setShowCreateSubjectModal(false);
      
      // Recargar materias y relaciones
      const [updatedSubjects, updatedSubjectProfessors] = await Promise.all([
        configurationService.getSubjects(),
        configurationService.getSubjectProfessors()
      ]);
      
      setSubjects(updatedSubjects);
      setSubjectProfessors(updatedSubjectProfessors);
      
      Swal.fire({
        icon: "success",
        title: "Materia creada",
        text: `La materia ${newSubject.subjectName} ha sido creada exitosamente`,
      });
    } catch (error) {
      console.error("Error al actualizar materias:", error);
    }
  };

  const handleSubjectAssigned = async (subjectGroupData) => {

    
    try {
      await configurationService.createSubjectGroups(subjectGroupData);

      setShowAssignSubjectModal(false);
      
      Swal.fire({
        icon: "success",
        title: "Materia asignada",
        text: "La materia ha sido asignada exitosamente al grupo",
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo asignar la materia al grupo.'
      });
      console.error("Error al asignar materia:", error);
    }
  };

  const handleProfessorAssigned = async () => {
    try {
      setShowAssignProfessorModal(false);
      
      // Recargar relaciones profesor-materia
      const [updatedSubjects, updatedSubjectProfessors] = await Promise.all([
        configurationService.getSubjects(),
        configurationService.getSubjectProfessors()
      ]);
      
      setSubjects(updatedSubjects);
      setSubjectProfessors(updatedSubjectProfessors);
      
      Swal.fire({
        icon: "success",
        title: "Profesor asignado",
        text: "El profesor ha sido asignado exitosamente a la materia",
      });
    } catch (error) {
      console.error("Error al asignar profesor:", error);
    }
  };

  const handleDataUpdated = async () => {
    try {
      // Recargar materias y relaciones
      const [updatedSubjects, updatedSubjectProfessors] = await Promise.all([
        configurationService.getSubjects(),
        configurationService.getSubjectProfessors()
      ]);
      
      setSubjects(updatedSubjects);
      setSubjectProfessors(updatedSubjectProfessors);
    } catch (error) {
      console.error("Error al actualizar datos:", error);
    }
  };
  

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setYearFilter(selectedYear);
    
    // Si seleccionaron el último año disponible, añadir dos años más
    if (parseInt(selectedYear) === availableYears[availableYears.length - 1]) {
      const lastYear = availableYears[availableYears.length - 1];
      setAvailableYears([...availableYears, lastYear + 1, lastYear + 2]);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestión de Grupos y Materias</h1>
        
        <div className="flex space-x-2">
          {activeTab === "subjects" && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-md flex items-center ${
                editMode 
                  ? "bg-amber-100 text-amber-700" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Edit size={18} className="mr-1" />
              {editMode ? "Finalizar edición" : "Editar relaciones"}
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
          >
            <Filter size={18} className="mr-1" />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
          
          {activeTab === "groups" && (
            <button
              onClick={() => setShowCreateSubjectModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
              title="Crear una nueva materia con opción de asignar profesor"
            >
              <Plus size={18} className="mr-1" />
              Crear Materia
            </button>
          )}
          
          {activeTab === "subjects" && (
            <button
              onClick={() => setShowAssignProfessorModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
            >
              <UserPlus size={18} className="mr-1" />
              Asignar Profesor
            </button>
          )}
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-4">
          <button
            onClick={() => {
              setActiveTab("groups");
              setEditMode(false);
            }}
            className={`py-2 px-4 flex items-center ${
              activeTab === "groups"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users size={18} className="mr-1" />
            Grupos
          </button>
          
          <button
            onClick={() => {
              setActiveTab("subjects");
              setEditMode(false);
            }}
            className={`py-2 px-4 flex items-center ${
              activeTab === "subjects"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen size={18} className="mr-1" />
            Materias y Profesores
          </button>
        </nav>
      </div>
      
 {/* Selección de año y periodo académico (siempre visible) */}
 <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="inline mr-1" />
              Año académico
            </label>
            <select
              value={yearFilter}
              onChange={handleYearChange}
              className="form-select w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="inline mr-1" />
              Periodo académico
            </label>
            <select
              ref={periodSelectorRef}
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className={`form-select w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${!yearFilter && 'opacity-50'}`}
              disabled={!yearFilter}
            >
              <option value="">
                {yearFilter ? "Seleccionar periodo" : "Primero seleccione un año"}
              </option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Contenido principal */}
      <div className="bg-gray-50 rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === "groups" ? (
          <div className="space-y-4 p-4">
            {/* Filtros */}
            {showFilters && (
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buscar grupo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Nombre o código del grupo..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nivel educativo
                    </label>
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos los niveles</option>
                      {levels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.levelName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Acordeón de niveles y grupos */}
            <div className="space-y-4">
              {Object.values(groupedByLevel).length > 0 ? (
                Object.values(groupedByLevel).map(({ level, groups }) => (
                  <LevelAccordion
  key={level.id}
  level={level}
  groups={groups}
  onCreateGroup={() => handleCreateGroup(level.id)}
  onEditGroup={handleEditGroup} // Nuevo prop
  onAssignSubject={handleAssignSubject}
  onViewSubjects={handleViewSubjects}
  onDeleteGroup={handleDeleteGroup}
  periodSelected={!!periodFilter}
/>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500">No se encontraron grupos con los filtros seleccionados.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <SubjectProfessorsTab
            subjects={subjects}
            professors={professors}
            subjectProfessors={subjectProfessors}
            showFilters={showFilters}
            editMode={editMode}
            onDataUpdated={handleDataUpdated}
          />
        )}
      </div>

      {/* Modales */}
      {showCreateGroupModal && (
        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          level={selectedLevel}
          onSave={saveNewGroup}
        />
      )}

      {showCreateSubjectModal && (
        <CreateSubjectModal
          isOpen={showCreateSubjectModal}
          onClose={() => setShowCreateSubjectModal(false)}
          onSave={handleSubjectCreated}
          professors={professors}
          withProfessorAssignment={true}
        />
      )}

      {showAssignSubjectModal && selectedGroup && (
        <AssignSubjectModal
          isOpen={showAssignSubjectModal}
          onClose={() => setShowAssignSubjectModal(false)}
          group={selectedGroup}
          onSave={handleSubjectAssigned}
          selectedPeriodId={periodFilter}
        />
      )}

      {showAssignProfessorModal && (
        <AssignProfessorModal
          isOpen={showAssignProfessorModal}
          onClose={() => setShowAssignProfessorModal(false)}
          onSave={handleProfessorAssigned}
          subjects={subjects}
          professors={professors}
        />
      )}


      {showEditGroupModal && selectedGroup && (
        <EditGroupModal
          isOpen={showEditGroupModal}
          onClose={() => setShowEditGroupModal(false)}
          group={selectedGroup}
          level={selectedGroup.level}
          professors={professors}
          onSave={handleGroupUpdated}
        />
      )}

      {/* Modales */}
{showSubjectsModal && selectedGroup && (
  <SubjectsModal
    isOpen={showSubjectsModal}
    onClose={() => setShowSubjectsModal(false)}
    group={selectedGroup}
    subjects={selectedGroup.subjectsData || []} // Usamos los datos cargados específicamente
  />
)}
    </div>
  );
};

export default StudentsGroupsTab;