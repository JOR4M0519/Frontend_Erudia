import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Edit, X, Plus } from "lucide-react";
import { configurationService, CreateSubjectModal, CreateDimensionModal, EditDimensionModal, EditSubjectModal } from "../";
import Swal from "sweetalert2";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const AreasTab = () => {
  // Estados para datos
  const [dimensionsWithSubjects, setDimensionsWithSubjects] = useState([]);
  const [groupedDimensions, setGroupedDimensions] = useState({});
  const [expandedDimensions, setExpandedDimensions] = useState({});
  
  // Estados para filtros
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [schemaFilter, setSchemaFilter] = useState("");
  const [educationalLevelFilter, setEducationalLevelFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  
  // Datos para selects
  const [schemas, setSchemas] = useState([]);
  const [educationalLevels, setEducationalLevels] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [subjectsByGroup, setSubjectsByGroup] = useState([]);
  
  // Estados para modales
  const [isCreateDimensionModalOpen, setIsCreateDimensionModalOpen] = useState(false);
  const [isEditDimensionModalOpen, setIsEditDimensionModalOpen] = useState(false);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedRelationId, setSelectedRelationId] = useState(null);
  
  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    fetchEducationalLevels();
    fetchSchemas();
  }, []);

  // Cargar periodos cuando cambia el año o esquema
  useEffect(() => {
    if (schemaFilter) {
      fetchPeriods(schemaFilter, yearFilter);
    }
  }, [yearFilter, schemaFilter]);

  // Cargar materias por grupo cuando cambia el periodo o nivel educativo
  useEffect(() => {
    if (periodFilter && educationalLevelFilter) {
      fetchSubjectsByGroupAndLevel();
    }
  }, [periodFilter, educationalLevelFilter]);

  // Cargar dimensiones y materias
  useEffect(() => {
    fetchDimensionsWithSubjects();
  }, [subjectsByGroup]);

  // Obtener niveles educativos
  const fetchEducationalLevels = async () => {
    try {
      const data = await configurationService.getEducationalLevels();
      setEducationalLevels(data);
      if (data.length > 0) {
        setEducationalLevelFilter(data[0].id);
      }
    } catch (error) {
      console.error("Error al obtener niveles educativos:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los niveles educativos'
      });
    }
  };

  // Obtener esquemas de calificación
  const fetchSchemas = async () => {
    try {
      const data = await configurationService.getGradeSettings();
      setSchemas(data);
      if (data.length > 0) {
        setSchemaFilter(data[0].id);
      }
    } catch (error) {
      console.error("Error al obtener esquemas de calificación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los esquemas de calificación'
      });
    }
  };

  // Obtener periodos según el esquema y año
  const fetchPeriods = async (settingId, year) => {
    try {
      const data = await configurationService.getPeriodsBySettingId(settingId, year);
      setPeriods(data);
      if (data.length > 0) {
        setPeriodFilter(data[0].id);
      }
    } catch (error) {
      console.error("Error al obtener periodos:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los periodos'
      });
    }
  };

  // Obtener materias por grupo y nivel
  const fetchSubjectsByGroupAndLevel = async () => {
    try {
      const data = await configurationService.getSubjectsByGroupAndLevel(periodFilter, educationalLevelFilter);
      setSubjectsByGroup(data);
    } catch (error) {
      console.error("Error al obtener materias por grupo y nivel:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las materias por grupo y nivel'
      });
    }
  };

  // Obtener dimensiones con materias
  const fetchDimensionsWithSubjects = async () => {
    try {
      setLoading(true);
      const data = await configurationService.getDimensionsGroupBySubject();
      setDimensionsWithSubjects(data);
      
      // Filtrar por materias disponibles en el grupo y nivel seleccionados
      const filteredData = subjectsByGroup.length > 0 
        ? data.filter(item => 
            subjectsByGroup.some(sg => sg.subjectProfessor.subject.id === item.subject.id)
          )
        : data;
      
      // Agrupar por dimensión
      const grouped = filteredData.reduce((acc, item) => {
        const dimensionId = item.dimension.id;
        if (!acc[dimensionId]) {
          acc[dimensionId] = {
            dimension: item.dimension,
            subjects: []
          };
        }
        // Añadir el ID de la relación junto con la materia
        acc[dimensionId].subjects.push({
          ...item.subject,
          relationId: item.id
        });
        return acc;
      }, {});
      
      setGroupedDimensions(grouped);
    } catch (error) {
      console.error("Error al obtener dimensiones con materias:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las dimensiones con materias'
      });
    } finally {
      setLoading(false);
    }
  };

  // Alternar expansión de dimensión
  const toggleDimension = (dimensionId) => {
    setExpandedDimensions(prev => ({
      ...prev,
      [dimensionId]: !prev[dimensionId]
    }));
  };

  // Crear nueva dimensión
  const handleCreateDimension = async (dimensionData) => {
    try {
      await configurationService.createDimension(dimensionData);
      fetchDimensionsWithSubjects();
      setIsCreateDimensionModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Dimensión creada correctamente'
      });
    } catch (error) {
      console.error("Error al crear dimensión:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la dimensión'
      });
    }
  };

  // Abrir modal para editar dimensión
  const handleOpenEditDimensionModal = (dimension) => {
    setSelectedDimension(dimension);
    setIsEditDimensionModalOpen(true);
  };

  // Editar dimensión
  const handleEditDimension = async (dimensionData) => {
    try {
      await configurationService.updateDimension(selectedDimension.id, dimensionData);
      fetchDimensionsWithSubjects();
      setIsEditDimensionModalOpen(false);
      setSelectedDimension(null);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Dimensión actualizada correctamente'
      });
    } catch (error) {
      console.error("Error al actualizar dimensión:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la dimensión'
      });
    }
  };

  // Eliminar dimensión
  const handleDeleteDimension = async (dimensionId) => {
    try {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede revertir",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await configurationService.deleteDimension(dimensionId);
          fetchDimensionsWithSubjects();
          Swal.fire(
            '¡Eliminado!',
            'La dimensión ha sido eliminada.',
            'success'
          );
        }
      });
    } catch (error) {
      console.error("Error al eliminar dimensión:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la dimensión'
      });
    }
  };

  // Abrir modal para editar materia
  const handleOpenEditSubjectModal = (subject, relationId) => {
    setSelectedSubject(subject);
    setSelectedRelationId(relationId);
    setIsEditSubjectModalOpen(true);
  };

  // Editar materia
  const handleEditSubject = async (subjectData) => {
    try {
      await configurationService.updateSubject(selectedSubject.id, subjectData);
      fetchDimensionsWithSubjects();
      setIsEditSubjectModalOpen(false);
      setSelectedSubject(null);
      setSelectedRelationId(null);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Materia actualizada correctamente'
      });
    } catch (error) {
      console.error("Error al actualizar materia:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la materia'
      });
    }
  };

  // Eliminar materia
  const handleDeleteSubject = async (subjectId) => {
    try {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede revertir",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await configurationService.deleteSubject(subjectId);
          fetchDimensionsWithSubjects();
          Swal.fire(
            '¡Eliminado!',
            'La materia ha sido eliminada.',
            'success'
          );
        }
      });
    } catch (error) {
      console.error("Error al eliminar materia:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la materia'
      });
    }
  };

  // Manejar el arrastre y soltar para cambiar materia de dimensión
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceDroppableId = result.source.droppableId;
    const destinationDroppableId = result.destination.droppableId;
    
    if (sourceDroppableId === destinationDroppableId) return;
    
    const sourceDimensionId = parseInt(sourceDroppableId.split('-')[1]);
    const destinationDimensionId = parseInt(destinationDroppableId.split('-')[1]);
    
    const draggedItemIndex = result.source.index;
    const subject = groupedDimensions[sourceDimensionId].subjects[draggedItemIndex];
    
    Swal.fire({
      title: '¿Cambiar dimensión?',
      text: `¿Deseas mover "${subject.subjectName}" a la dimensión "${groupedDimensions[destinationDimensionId].dimension.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await configurationService.updateSubjectDimension(
            subject.relationId,
            destinationDimensionId,
            subject.id
          );
          fetchDimensionsWithSubjects();
          Swal.fire(
            '¡Cambiado!',
            'La materia ha sido movida a la nueva dimensión.',
            'success'
          );
        } catch (error) {
          console.error("Error al cambiar la dimensión de la materia:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cambiar la dimensión de la materia'
          });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg mb-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año escolar</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 cursor-pointer"
          >
            {[yearFilter - 1, yearFilter, yearFilter + 1].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Esquema de calificación</label>
          <select
            value={schemaFilter}
            onChange={(e) => setSchemaFilter(e.target.value)}
            className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 cursor-pointer"
          >
            <option value="">Seleccione un esquema</option>
            {schemas.map((schema) => (
              <option key={schema.id} value={schema.id}>
                {schema.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nivel educativo</label>
          <select
            value={educationalLevelFilter}
            onChange={(e) => setEducationalLevelFilter(e.target.value)}
            className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 cursor-pointer"
          >
            <option value="">Seleccione un nivel</option>
            {educationalLevels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.levelName}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 cursor-pointer"
            disabled={!schemaFilter}
          >
            <option value="">Seleccione un periodo</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón Crear Dimensión */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsCreateDimensionModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus className="h-5 w-5 mr-2" />
          Crear dimensión
        </button>
      </div>

      {/* Lista de dimensiones con materias */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Cargando...</span>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-4">
            {Object.values(groupedDimensions).length > 0 ? (
              Object.values(groupedDimensions).map((item) => (
                <div
                  key={item.dimension.id}
                  className="bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200"
                >
                  {/* Cabecera de dimensión */}
                  <div
                    className={`p-4 flex justify-between items-center cursor-pointer ${
                      expandedDimensions[item.dimension.id] ? "bg-yellow-400 text-black" : "bg-gray-200"
                    }`}
                    onClick={() => toggleDimension(item.dimension.id)}
                  >
                    <div className="flex items-center">
                      {expandedDimensions[item.dimension.id] ? (
                        <ChevronUp className="h-5 w-5 mr-2" />
                      ) : (
                        <ChevronDown className="h-5 w-5 mr-2" />
                      )}
                      <h3 className="font-semibold">{item.dimension.name}</h3>
                      <span className="text-sm text-gray-600 ml-2">
                        {item.dimension.description}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDimensionModal(item.dimension);
                        }}
                        className="p-1 hover:bg-gray-300 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDimension(item.dimension.id);
                        }}
                        className="p-1 hover:bg-gray-300 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de materias */}
                  {expandedDimensions[item.dimension.id] && (
                    <Droppable droppableId={`dimension-${item.dimension.id}`}>
                      {(provided) => (
                        <div 
                          className="p-4"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <ul className="space-y-2">
                            {item.subjects.map((subject, index) => (
                              <Draggable 
                                key={`${subject.id}-${subject.relationId}`} 
                                draggableId={`subject-${subject.id}-${subject.relationId}`} 
                                index={index}
                              >
                                {(provided) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                                  >
                                    <div className="flex items-center">
                                      <span className="mr-2">
                                        {subject.status === 'A' ? (
                                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                        ) : (
                                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                        )}
                                      </span>
                                      <span>{subject.subjectName}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleOpenEditSubjectModal(subject, subject.relationId)}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSubject(subject.id)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </li>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ul>
                        </div>
                      )}
                    </Droppable>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No hay dimensiones disponibles con los filtros seleccionados.</p>
              </div>
            )}
          </div>
        </DragDropContext>
      )}

      {/* Modales */}
      {isCreateDimensionModalOpen && (
        <CreateDimensionModal
          onClose={() => setIsCreateDimensionModalOpen(false)}
          onSave={handleCreateDimension}
        />
      )}

      {isEditDimensionModalOpen && selectedDimension && (
        <EditDimensionModal
          dimension={selectedDimension}
          onClose={() => {
            setIsEditDimensionModalOpen(false);
            setSelectedDimension(null);
          }}
          onSave={handleEditDimension}
        />
      )}

      {isEditSubjectModalOpen && selectedSubject && (
        <EditSubjectModal
          subject={selectedSubject}
          relationId={selectedRelationId}
          dimensions={Object.values(groupedDimensions).map(item => item.dimension)}
          currentDimensionId={Object.keys(groupedDimensions).find(
            key => groupedDimensions[key].subjects.some(s => s.id === selectedSubject.id)
          )}
          onClose={() => {
            setIsEditSubjectModalOpen(false);
            setSelectedSubject(null);
            setSelectedRelationId(null);
          }}
          onSave={handleEditSubject}
          onChangeDimension={async (newDimensionId) => {
            try {
              await configurationService.updateSubjectDimension(
                selectedRelationId,
                newDimensionId,
                selectedSubject.id
              );
              fetchDimensionsWithSubjects();
              setIsEditSubjectModalOpen(false);
              setSelectedSubject(null);
              setSelectedRelationId(null);
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Dimensión de la materia actualizada correctamente'
              });
            } catch (error) {
              console.error("Error al cambiar la dimensión de la materia:", error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cambiar la dimensión de la materia'
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default AreasTab;
