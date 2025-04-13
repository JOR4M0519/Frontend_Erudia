import React, { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Swal from "sweetalert2";
import { configurationService, FiltersPanel, GroupsView, SubjectsPanel } from "../../";

const SubjectGroupsTab = ({
  subjectGroups = [],
  allGroups = [],
  allSubjects = [],
  allProfessors = [],
  periods = [],
  levels = [],
  showFilters = true,
  editMode = false,
  onSubjectGroupUpdated,
  selectedPeriodId
}) => {
  // Estados para filtros
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState(selectedPeriodId || "");
  const [professorFilter, setProfessorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  // Estado para vista agrupada
  const [groupByType, setGroupByType] = useState("group");
  
  // Estado para materias y grupos
  const [groupedAssignments, setGroupedAssignments] = useState({});
  const [unassignedSubjects, setUnassignedSubjects] = useState([]);
  
  // Estado para controlar qué elementos están expandidos
  const [expandedItems, setExpandedItems] = useState({});
  
  // Estado para controlar carga y operaciones
  const [loading, setLoading] = useState(false);
  
  // Estado para mostrar panel lateral de materias-profesor disponibles
  const [showSubjectsPanel, setShowSubjectsPanel] = useState(editMode);
  
  // Estado para búsqueda en panel lateral (independiente del principal)
  const [panelSearchTerm, setPanelSearchTerm] = useState("");
  
  // Estado para materias-profesor disponibles (filtradas)
  const [availableSubjectProfessors, setAvailableSubjectProfessors] = useState([]);
  // Agregar este estado al inicio del componente junto con los otros estados
const [availableGroups, setAvailableGroups] = useState(allGroups || []);

// Y luego agregar este useEffect
useEffect(() => {
  const loadActiveGroups = async () => {
    try {
      setLoading(true);
      const activeGroupsData = await configurationService.getActiveGroups();
      // Combinar con los grupos existentes sin duplicados
      const allAvailableGroups = [...allGroups];
      const existingGroupIds = new Set(allGroups.map(group => group.id));
      
      activeGroupsData.forEach(group => {
        if (!existingGroupIds.has(group.id)) {
          allAvailableGroups.push(group);
        }
      });
      
      setAvailableGroups(allAvailableGroups);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar grupos activos:", error);
      setLoading(false);
    }
  };
  
  loadActiveGroups();
}, [allGroups]);

  // Estado para todas las materias-profesor
  const [allSubjectProfessors, setAllSubjectProfessors] = useState([]);
  
  // Estado para modal de copia múltiple
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySource, setCopySource] = useState([]);
  const [selectedTargetGroups, setSelectedTargetGroups] = useState([]);
  const [selectedTargetPeriods, setSelectedTargetPeriods] = useState([]);

  // Actualizar periodFilter cuando cambia selectedPeriodId
  useEffect(() => {
    if (selectedPeriodId) {
      setPeriodFilter(selectedPeriodId);
    }
  }, [selectedPeriodId]);

  // Cargar las relaciones materia-profesor al iniciar
  useEffect(() => {
    const loadSubjectProfessors = async () => {
      try {
        setLoading(true);
        const subjectProfessorsData = await configurationService.getSubjectProfessors();
        setAllSubjectProfessors(subjectProfessorsData);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar relaciones materia-profesor:", error);
        setLoading(false);
      }
    };
    
    loadSubjectProfessors();
  }, []);
  
// Y luego agregar este useEffect
useEffect(() => {
  const loadActiveGroups = async () => {
    try {
      setLoading(true);
      const activeGroupsData = await configurationService.getActiveGroups();
      // Combinar con los grupos existentes sin duplicados
      const allAvailableGroups = [...allGroups];
      const existingGroupIds = new Set(allGroups.map(group => group.id));
      
      activeGroupsData.forEach(group => {
        if (!existingGroupIds.has(group.id)) {
          allAvailableGroups.push(group);
        }
      });
      
      setAvailableGroups(allAvailableGroups);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar grupos activos:", error);
      setLoading(false);
    }
  };
  
  loadActiveGroups();
}, [allGroups]);
  
  // Agrupar asignaciones cuando cambian los datos o filtros
  useEffect(() => {
    groupAssignments();
  }, [subjectGroups, subjectSearchTerm, groupFilter, periodFilter, professorFilter, statusFilter, levelFilter, groupByType, allSubjects]);

  // Filtrar materias-profesor disponibles para el panel lateral
  useEffect(() => {
    if (!allSubjectProfessors.length) return;
    
    const filtered = allSubjectProfessors.filter(sp => {
      const matchesSearch = 
        sp.subject.subjectName.toLowerCase().includes(panelSearchTerm.toLowerCase()) ||
        (sp.professor && 
         ((sp.professor.firstName && sp.professor.firstName.toLowerCase().includes(panelSearchTerm.toLowerCase())) || 
          (sp.professor.lastName && sp.professor.lastName.toLowerCase().includes(panelSearchTerm.toLowerCase()))));
      
      // Filtro adicional por nivel si es necesario
      const matchesLevel = !levelFilter || 
        (sp.subject.levelId && sp.subject.levelId.toString() === levelFilter);
        
      return matchesSearch && matchesLevel;
    });
    
    setAvailableSubjectProfessors(filtered);
  }, [allSubjectProfessors, panelSearchTerm, levelFilter]);

  // Actualizar showSubjectsPanel cuando cambia editMode
  useEffect(() => {
    setShowSubjectsPanel(editMode);
  }, [editMode]);
  
  // Agrupar asignaciones según el tipo de agrupación seleccionado
  const groupAssignments = () => {
    const filteredAssignments = getFilteredSubjectGroups();
    
    if (groupByType === "group") {
      groupByGroups(filteredAssignments);
    } else {
      groupBySubjects(filteredAssignments);
    }
  };

  // Agrupar por grupos
// Agrupar por grupos
const groupByGroups = (filteredAssignments) => {
  const grouped = {};
  
  // Primero, agregar todos los grupos disponibles
  availableGroups.forEach(group => {
    // Aplicar filtros si están establecidos
    const matchesGroupFilter = groupFilter === "" || group.id.toString() === groupFilter;
    const matchesStatusFilter = statusFilter === "" || group.status === statusFilter;
    const matchesLevelFilter = levelFilter === "" || (group.level && group.level.id.toString() === levelFilter);
    
    // Solo incluir el grupo si cumple con los filtros
    if (matchesGroupFilter && matchesStatusFilter && matchesLevelFilter) {
      grouped[group.id] = {
        group: group,
        subjects: []
      };
    }
  });
  
  // Luego, agregar las materias a los grupos correspondientes
  filteredAssignments.forEach(item => {
    const groupId = item.groups.id;
    
    if (!grouped[groupId]) {
      // Si el grupo no estaba en la lista (por algún motivo), agregarlo
      grouped[groupId] = {
        group: item.groups,
        subjects: []
      };
    }
    
    grouped[groupId].subjects.push({
      id: item.id,
      subjectProfessor: item.subjectProfessor,
      period: item.academicPeriod
    });
  });
  
  setGroupedAssignments(grouped);
  
  // No necesitamos unassignedSubjects cuando agrupamos por grupos
  setUnassignedSubjects([]);
};


  // Agrupar por materias-profesor
  const groupBySubjects = (filteredAssignments) => {
    const grouped = {};
    const subjectsWithAssignments = new Set();
    
    // Agrupar por materia-profesor
    filteredAssignments.forEach(item => {
      const subjectProfessorId = item.subjectProfessor.id;
      const subjectId = item.subjectProfessor.subject.id;
      const professorId = item.subjectProfessor.professor.id;
      
      const key = `${subjectId}-${professorId}`;
      subjectsWithAssignments.add(subjectId);
      
      if (!grouped[key]) {
        grouped[key] = {
          subjectProfessor: item.subjectProfessor,
          groups: []
        };
      }
      
      grouped[key].groups.push({
        id: item.id,
        group: item.groups,
        period: item.academicPeriod
      });
    });
    
    // Encontrar materias sin asignaciones
    const unassigned = allSubjects.filter(subject => 
      !subjectsWithAssignments.has(subject.id) &&
      subject.subjectName.toLowerCase().includes(subjectSearchTerm.toLowerCase())
    );
    
    setGroupedAssignments(grouped);
    setUnassignedSubjects(unassigned);
  };

  // Filtrar asignaciones de materias con grupos
  const getFilteredSubjectGroups = () => {
    return subjectGroups.filter(item => {
      const matchesSubject = subjectSearchTerm === "" ||
        item.subjectProfessor.subject.subjectName.toLowerCase().includes(subjectSearchTerm.toLowerCase());
      
      const matchesGroup = groupFilter === "" || 
        item.groups.id.toString() === groupFilter;
      
      const matchesPeriod = periodFilter === "" || 
        item.academicPeriod.id.toString() === periodFilter;
      
      const matchesProfessor = professorFilter === "" || 
        item.subjectProfessor.professor.id.toString() === professorFilter;
      
      const matchesStatus = statusFilter === "" || 
        item.groups.status === statusFilter;
        
      const matchesLevel = levelFilter === "" || 
        item.groups.level.id.toString() === levelFilter;

      return matchesSubject && matchesGroup && matchesPeriod && matchesProfessor && matchesStatus && matchesLevel;
    });
  };

  // Expandir/colapsar elemento
  const toggleItem = (itemKey) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // Resetear filtros
  const resetFilters = () => {
    setSubjectSearchTerm("");
    setGroupFilter("");
    setPeriodFilter(selectedPeriodId || "");
    setProfessorFilter("");
    setStatusFilter("");
    setLevelFilter("");
    setPanelSearchTerm("");
  };

  // Verificar si un grupo ya está asignado a una materia-profesor
  const isGroupAssignedToSubjectProfessor = (groupId, subjectProfessorId, periodId) => {
    return subjectGroups.some(
      item => 
        item.groups.id === groupId && 
        item.subjectProfessor.id === subjectProfessorId && 
        item.academicPeriod.id === periodId
    );
  };

  // Manejar el arrastre y soltar
  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    // Si no hay destino o el origen es igual al destino, no hacer nada
    if (!destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)) {
      return;
    }

    try {
      setLoading(true);

      // Caso 1: Arrastrar desde el panel de materias-profesor a un grupo
      if (source.droppableId === "subjects-panel" &&
        destination.droppableId.startsWith("group-")) {

        // Verificar si hay un periodo seleccionado
        if (!periodFilter) {
          Swal.fire({
            icon: "warning",
            title: "Periodo requerido",
            text: "Debe seleccionar un periodo académico para asignar materias"
          });
          setLoading(false);
          return;
        }

        const subjectProfessorId = availableSubjectProfessors[source.index].id;
        const groupId = parseInt(destination.droppableId.split("-")[1]);
        const periodId = parseInt(periodFilter);

        // Verificar si el grupo ya está asignado a esta materia-profesor en este periodo
        if (isGroupAssignedToSubjectProfessor(groupId, subjectProfessorId, periodId)) {
          Swal.fire({
            icon: "warning",
            title: "Duplicado",
            text: "Este grupo ya está asignado a esta materia con este profesor en el periodo seleccionado"
          });
          setLoading(false);
          return;
        }

        // Crear nueva asignación
        const newAssignment = {
          subjectProfessor: { id: subjectProfessorId },
          groups: { id: groupId },
          academicPeriod: { id: periodId }
        };

        await configurationService.createSubjectGroups(newAssignment);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Asignación creada",
          text: "La materia se ha asignado correctamente al grupo",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });

        // Notificar al componente padre para actualizar los datos
        if (onSubjectGroupUpdated) {
          await onSubjectGroupUpdated();
        }
      }
      
      // Caso 2: Arrastrar desde el panel de materias a una materia-profesor
      else if (source.droppableId === "subjects-panel" &&
        destination.droppableId.startsWith("subject-professor-")) {

        // Verificar si hay un periodo seleccionado
        if (!periodFilter) {
          Swal.fire({
            icon: "warning",
            title: "Periodo requerido",
            text: "Debe seleccionar un periodo académico para asignar grupos"
          });
          setLoading(false);
          return;
        }

        // Mostrar modal para seleccionar grupo
        const { value: groupId } = await Swal.fire({
          title: 'Seleccionar grupo',
          input: 'select',
          inputOptions: Object.fromEntries(
            availableGroups.map(group => [
              group.id, 
              `${group.groupName} (${group.groupCode}) - ${group.level.levelName}`
            ])
          ),
          inputPlaceholder: 'Seleccione un grupo',
          showCancelButton: true,
          inputValidator: (value) => {
            return new Promise((resolve) => {
              if (!value) {
                resolve('Debe seleccionar un grupo');
              } else {
                resolve();
              }
            });
          }
        });

        if (!groupId) {
          setLoading(false);
          return;
        }

        const subjectProfessorId = parseInt(destination.droppableId.split("-")[2]);
        const parsedGroupId = parseInt(groupId);
        const periodId = parseInt(periodFilter);

        // Verificar si el grupo ya está asignado a esta materia-profesor en este periodo
        if (isGroupAssignedToSubjectProfessor(parsedGroupId, subjectProfessorId, periodId)) {
          Swal.fire({
            icon: "warning",
            title: "Duplicado",
            text: "Este grupo ya está asignado a esta materia con este profesor en el periodo seleccionado"
          });
          setLoading(false);
          return;
        }

        // Crear nueva asignación
        const newAssignment = {
          subjectProfessor: { id: subjectProfessorId },
          groups: { id: parsedGroupId },
          academicPeriod: { id: periodId }
        };

        await configurationService.createSubjectGroups(newAssignment);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Asignación creada",
          text: "La materia se ha asignado correctamente al grupo",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });

        // Notificar al componente padre para actualizar los datos
        if (onSubjectGroupUpdated) {
          await onSubjectGroupUpdated();
        }
      }

      // Caso 3: Mover un grupo de una materia-profesor a otra
      else if (source.droppableId.startsWith("subject-professor-") &&
        destination.droppableId.startsWith("subject-professor-") &&
        source.droppableId !== destination.droppableId) {

        const sourceSubjectProfessorId = parseInt(source.droppableId.split("-")[2]);
        const destSubjectProfessorId = parseInt(destination.droppableId.split("-")[2]);
        
        const sourceKey = Object.keys(groupedAssignments).find(
          key => groupedAssignments[key].subjectProfessor.id === sourceSubjectProfessorId
        );
        
        if (!sourceKey) {
          throw new Error("No se encontró la asignación de origen");
        }
        
        const assignmentToMove = groupedAssignments[sourceKey].groups[source.index];
        const groupId = assignmentToMove.group.id;
        const periodId = assignmentToMove.period.id;

        // Verificar si el grupo ya está asignado a la materia-profesor destino
        if (isGroupAssignedToSubjectProfessor(groupId, destSubjectProfessorId, periodId)) {
          Swal.fire({
            icon: "warning",
            title: "Duplicado",
            text: "Este grupo ya está asignado a la materia-profesor destino en este periodo"
          });
          setLoading(false);
          return;
        }

        // Eliminar la asignación anterior
        await configurationService.deleteSubjectGroups(assignmentToMove.id);

        // Crear nueva asignación con la materia-profesor destino
        const newAssignment = {
          subjectProfessor: { id: destSubjectProfessorId },
          groups: { id: groupId },
          academicPeriod: { id: periodId }
        };

        await configurationService.createSubjectGroups(newAssignment);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Grupo movido",
          text: "El grupo se ha movido correctamente a la nueva materia-profesor",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });

        // Notificar al componente padre para actualizar los datos
        if (onSubjectGroupUpdated) {
          await onSubjectGroupUpdated();
        }
      }

    } catch (error) {
      console.error("Error al manejar arrastre:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo completar la operación"
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar una asignación de grupo-materia
  const handleDeleteAssignment = async (assignmentId) => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará la asignación del grupo a esta materia",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        setLoading(true);
        await configurationService.deleteSubjectGroups(assignmentId);

        // Notificar al componente padre para actualizar los datos
        if (onSubjectGroupUpdated) {
          await onSubjectGroupUpdated();
        }

        Swal.fire(
          "Eliminado",
          "La asignación ha sido eliminada correctamente",
          "success"
        );
      }
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la asignación"
      });
    } finally {
      setLoading(false);
    }
  };

  // Iniciar proceso de copia múltiple
  const handleStartCopy = (item) => {
    setCopySource([item]);
    setSelectedTargetGroups([]);
    setSelectedTargetPeriods([]);
    setShowCopyModal(true);
  };

  // Iniciar proceso de copia múltiple desde el panel
  const handleStartMultipleCopy = (selectedSubjects) => {
    setCopySource(selectedSubjects);
    setSelectedTargetGroups([]);
    setSelectedTargetPeriods([]);
    setShowCopyModal(true);
  };

  // Ejecutar copia múltiple
  const handleExecuteCopy = async () => {
    if (selectedTargetGroups.length === 0 || selectedTargetPeriods.length === 0 || copySource.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Selección incompleta",
        text: "Debe seleccionar al menos una materia, un grupo y un periodo destino"
      });
      return;
    }

    try {
      setLoading(true);
      
      let createdCount = 0;
      let skippedCount = 0;
      
      for (const subject of copySource) {
        // Obtener el ID de subjectProfessor según la estructura del objeto
        const subjectProfessorId = subject.subjectProfessor?.id || subject.id;
        
        for (const groupId of selectedTargetGroups) {
          for (const periodId of selectedTargetPeriods) {
            // Verificar si ya existe la asignación
            if (isGroupAssignedToSubjectProfessor(
              parseInt(groupId), 
              subjectProfessorId, 
              parseInt(periodId)
            )) {
              skippedCount++;
              continue;
            }
            
            // Crear nueva asignación
            const newAssignment = {
              subjectProfessor: { id: subjectProfessorId },
              groups: { id: parseInt(groupId) },
              academicPeriod: { id: parseInt(periodId) }
            };
            
            await configurationService.createSubjectGroups(newAssignment);
            createdCount++;
          }
        }
      }
      
      setShowCopyModal(false);
      
      // Notificar al componente padre para actualizar los datos
      if (onSubjectGroupUpdated) {
        await onSubjectGroupUpdated();
      }
      
      Swal.fire({
        icon: "success",
        title: "Copia completada",
        text: `Se crearon ${createdCount} asignaciones. ${skippedCount > 0 ? `${skippedCount} ya existían y fueron omitidas.` : ''}`
      });
      
    } catch (error) {
      console.error("Error al copiar asignaciones:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron copiar todas las asignaciones"
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener nombre completo del profesor
  const getProfessorFullName = (professor) => {
    return `${professor.firstName || ''} ${professor.lastName || ''}`.trim() || 'Sin nombre';
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Panel principal */}
        <div className={`flex-grow ${showSubjectsPanel ? 'md:w-2/3' : 'w-full'}`}>
          {/* Filtros */}
          {showFilters && (
            <FiltersPanel
              subjectSearchTerm={subjectSearchTerm}
              setSubjectSearchTerm={setSubjectSearchTerm}
              groupFilter={groupFilter}
              setGroupFilter={setGroupFilter}
              periodFilter={periodFilter}
              setPeriodFilter={setPeriodFilter}
              professorFilter={professorFilter}
              setProfessorFilter={setProfessorFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              levelFilter={levelFilter}
              setLevelFilter={setLevelFilter}
              groupByType={groupByType}
              setGroupByType={setGroupByType}
              showSubjectsPanel={showSubjectsPanel}
              setShowSubjectsPanel={setShowSubjectsPanel}
              resetFilters={resetFilters}
              allGroups={availableGroups}
              allProfessors={allProfessors}
              levels={levels}
              periods={periods}
              getProfessorFullName={getProfessorFullName}
            />
          )}

          {/* Vista de grupos/materias */}
          <GroupsView
            loading={loading}
            groupByType={groupByType}
            groupedAssignments={groupedAssignments}
            expandedItems={expandedItems}
            toggleItem={toggleItem}
            editMode={editMode}
            handleStartCopy={handleStartCopy}
            handleDeleteAssignment={handleDeleteAssignment}
            getProfessorFullName={getProfessorFullName}
            unassignedSubjects={unassignedSubjects}
          />
        </div>

        {/* Panel lateral de materias disponibles */}
        {showSubjectsPanel && (
          <SubjectsPanel
            availableSubjectProfessors={availableSubjectProfessors}
            panelSearchTerm={panelSearchTerm}
            setPanelSearchTerm={setPanelSearchTerm}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            levels={levels}
            onCopyMultiple={handleStartMultipleCopy}
            onClose={() => setShowSubjectsPanel(false)}
          />
        )}

        {/* Modal de copia múltiple */}
        {showCopyModal && (
          <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Copiar materias a múltiples grupos</h2>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Materias seleccionadas ({copySource.length})</h3>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  {copySource.map(sp => {
                    // Manejar diferentes estructuras de objetos
                    const subject = sp.subject || sp.subjectProfessor?.subject;
                    const professor = sp.professor || sp.subjectProfessor?.professor;
                    
                    return (
                      <div key={sp.id || sp.subjectProfessor?.id} className="mb-1 text-sm">
                        <span className="font-medium">{subject?.subjectName}</span>
                        <span className="text-gray-500"> - {getProfessorFullName(professor)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Seleccionar grupos destino</h3>
                <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                {availableGroups.map(group => (
                    <div key={group.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id={`group-${group.id}`}
                        value={group.id}
                        checked={selectedTargetGroups.includes(group.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTargetGroups([...selectedTargetGroups, group.id.toString()]);
                          } else {
                            setSelectedTargetGroups(selectedTargetGroups.filter(id => id !== group.id.toString()));
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`group-${group.id}`} className="text-sm">
                        {group.groupName} ({group.groupCode}) - {group.level?.levelName || 'Sin nivel'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Seleccionar periodos destino</h3>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  {periods.map(period => (
                    <div key={period.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id={`period-${period.id}`}
                        value={period.id}
                        checked={selectedTargetPeriods.includes(period.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTargetPeriods([...selectedTargetPeriods, period.id.toString()]);
                          } else {
                            setSelectedTargetPeriods(selectedTargetPeriods.filter(id => id !== period.id.toString()));
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`period-${period.id}`} className="text-sm">
                        {period.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExecuteCopy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "Copiar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default SubjectGroupsTab;
