import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Edit, X, Plus, Move, Trash2 } from "lucide-react";
import { configurationService } from "../";
import Swal from "sweetalert2";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const AreasTab = () => {
  // Estados para datos
  const [dimensions, setDimensions] = useState([]);
  const [unassignedSubjects, setUnassignedSubjects] = useState([]);
  const [groupedDimensions, setGroupedDimensions] = useState({});
  
  // Estado para seguimiento de dimensiones expandidas
  const [expandedDimensions, setExpandedDimensions] = useState({});
  
  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    fetchDimensionsWithSubjects();
    fetchAllSubjects();
  }, []);

  // Obtener todas las materias para identificar las no asignadas
  const fetchAllSubjects = async () => {
    try {
      const allSubjects = await configurationService.getSubjects();
      const dimensionsWithSubjects = await configurationService.getDimensionsGroupBySubject();
      
      // Identificar materias no asignadas a dimensiones
      const assignedSubjectIds = dimensionsWithSubjects.map(item => item.subject.id);
      const unassigned = allSubjects.filter(subject => 
        !assignedSubjectIds.includes(subject.id)
      );
      
      setUnassignedSubjects(unassigned);
    } catch (error) {
      console.error("Error al obtener materias:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las materias'
      });
    }
  };

  // Obtener dimensiones con materias
  const fetchDimensionsWithSubjects = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las dimensiones (incluyendo las que no tienen materias)
      const allDimensions = await configurationService.getDimensions();
      setDimensions(allDimensions);
      
      // Obtener relaciones entre dimensiones y materias
      const relationData = await configurationService.getDimensionsGroupBySubject();
      
      // Agrupar por dimensión
      const grouped = relationData.reduce((acc, item) => {
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
      
      // Asegurarse de que todas las dimensiones estén incluidas, incluso las que no tienen materias
      const completeGrouped = allDimensions.reduce((acc, dimension) => {
        if (!acc[dimension.id]) {
          acc[dimension.id] = {
            dimension: dimension,
            subjects: []
          };
        }
        return acc;
      }, grouped);
      
      setGroupedDimensions(completeGrouped);
      
      // Expandir todas las dimensiones por defecto para mejorar la experiencia de arrastrar y soltar
      const initialExpanded = allDimensions.reduce((acc, dimension) => {
        acc[dimension.id] = true;
        return acc;
      }, {});
      setExpandedDimensions(initialExpanded);
      
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
  const handleCreateDimension = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Crear Nueva Dimensión',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Nombre">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Descripción">',
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        return {
          name: document.getElementById('swal-input1').value,
          description: document.getElementById('swal-input2').value
        }
      }
    });

    if (formValues) {
      try {
        await configurationService.createDimension(formValues);
        fetchDimensionsWithSubjects();
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
    }
  };

  // Editar dimensión
  const handleEditDimension = async (dimension) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Dimensión',
      html:
        `<input id="swal-input1" class="swal2-input" value="${dimension.name}" placeholder="Nombre">` +
        `<input id="swal-input2" class="swal2-input" value="${dimension.description || ''}" placeholder="Descripción">`,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Actualizar',
      preConfirm: () => {
        return {
          name: document.getElementById('swal-input1').value,
          description: document.getElementById('swal-input2').value
        }
      }
    });

    if (formValues) {
      try {
        await configurationService.updateDimension(dimension.id, formValues);
        fetchDimensionsWithSubjects();
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
    }
  };

  // Eliminar dimensión
// Eliminar dimensión
const handleDeleteDimension = async (dimensionId) => {
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
      try {
        await configurationService.deleteDimension(dimensionId);
        fetchDimensionsWithSubjects();
        fetchAllSubjects();
        Swal.fire(
          '¡Eliminado!',
          'La dimensión ha sido eliminada.',
          'success'
        );
      } catch (error) {
        console.error("Error al eliminar dimensión:", error);
        
        // Manejar diferentes tipos de respuestas de error del backend
        if (error.response) {
          const status = error.response.status;
          const errorMessage = error.response.data || 'Error desconocido';
          
          // Manejar errores específicos según el código de estado
          if (status === 409) { // CONFLICT
            Swal.fire({
              icon: 'error',
              title: 'No se puede eliminar',
              text: errorMessage || 'Esta dimensión está siendo utilizada y no puede ser eliminada.'
            });
          } else if (status === 404) { // NOT_FOUND
            Swal.fire({
              icon: 'error',
              title: 'Dimensión no encontrada',
              text: errorMessage || 'La dimensión que intentas eliminar no existe.'
            });
          } else {
            // Otros errores HTTP
            Swal.fire({
              icon: 'error',
              title: `Error (${status})`,
              text: errorMessage || 'Ocurrió un error al procesar la solicitud.'
            });
          }
        } else if (error.request) {
          // La solicitud se realizó pero no se recibió respuesta
          Swal.fire({
            icon: 'error',
            title: 'Sin respuesta del servidor',
            text: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
          });
        } else {
          // Error al configurar la solicitud
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Ocurrió un error al intentar eliminar la dimensión.'
          });
        }
      }
    }
  } catch (error) {
    // Error al mostrar el diálogo de confirmación
    console.error("Error en el diálogo de confirmación:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
    });
  }
};

  // Eliminar relación entre materia y dimensión
  const handleDeleteRelation = async (relationId) => {
    try {
      const result = await Swal.fire({
        title: '¿Desasignar materia?',
        text: "La materia se moverá a la lista de no asignadas",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, desasignar',
        cancelButtonText: 'Cancelar'
      });
      
      if (result.isConfirmed) {
        await configurationService.deleteSubjectDimension(relationId);
        fetchDimensionsWithSubjects();
        fetchAllSubjects();
        Swal.fire(
          '¡Desasignada!',
          'La materia ha sido desasignada de la dimensión.',
          'success'
        );
      }
    } catch (error) {
      console.error("Error al eliminar relación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo desasignar la materia'
      });
    }
  };

  // Manejar el arrastre y soltar para cambiar materia de dimensión
  const handleDragEnd = async (result) => {
    console.log("Drag end result:", result); // Añadir log para depuración
    
    if (!result.destination) {
      console.log("No destination found");
      return;
    }
    
    // Extraer información de origen y destino
    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;
    
    console.log(`Source: ${sourceId}, Destination: ${destId}`);
    
    // Determinar tipo de operación
    const isFromDimension = sourceId.startsWith('dimension-');
    const isFromUnassigned = sourceId === 'unassigned-subjects';
    const isToDimension = destId.startsWith('dimension-');
    const isToUnassigned = destId === 'unassigned-subjects';
    
    // Caso 1: Mover entre dimensiones
    if (isFromDimension && isToDimension) {
      const sourceDimensionId = parseInt(sourceId.split('-')[1]);
      const destinationDimensionId = parseInt(destId.split('-')[1]);
      
      if (sourceDimensionId === destinationDimensionId) {
        console.log("Same dimension, no action needed");
        return;
      }
      
      const subjectToMove = groupedDimensions[sourceDimensionId].subjects[result.source.index];
      const sourceDimension = groupedDimensions[sourceDimensionId].dimension;
      const destDimension = groupedDimensions[destinationDimensionId].dimension;
      
      console.log("Moving subject between dimensions:", subjectToMove);
      
      // Mostrar confirmación
      const confirmResult = await Swal.fire({
        title: '¿Mover materia?',
        html: `¿Estás seguro de mover <strong>${subjectToMove.subjectName}</strong> de la dimensión <strong>${sourceDimension.name}</strong> a <strong>${destDimension.name}</strong>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, mover',
        cancelButtonText: 'Cancelar'
      });
      
      if (confirmResult.isConfirmed) {
        try {
          console.log("Calling API to update subject dimension:", {
            relationId: subjectToMove.relationId,
            dimensionId: destinationDimensionId,
            subjectId: subjectToMove.id
          });
          
          await configurationService.updateSubjectDimension(
            destinationDimensionId,
            subjectToMove.id
          );
          
          fetchDimensionsWithSubjects();
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Materia movida correctamente'
          });
        } catch (error) {
          console.error("Error al mover materia:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo mover la materia'
          });
        }
      }
    }
    // Caso 2: Asignar desde no asignadas a una dimensión
    else if (isFromUnassigned && isToDimension) {
      const destinationDimensionId = parseInt(destId.split('-')[1]);
      const subjectToMove = unassignedSubjects[result.source.index];
      const destDimension = groupedDimensions[destinationDimensionId].dimension;
      
      console.log("Assigning subject to dimension:", subjectToMove);
      
      // Mostrar confirmación
      const confirmResult = await Swal.fire({
        title: '¿Asignar materia?',
        html: `¿Estás seguro de asignar <strong>${subjectToMove.subjectName}</strong> a la dimensión <strong>${destDimension.name}</strong>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, asignar',
        cancelButtonText: 'Cancelar'
      });
      
      if (confirmResult.isConfirmed) {
        try {
          console.log("Calling API to create subject dimension:", {
            dimensionId: destinationDimensionId,
            subjectId: subjectToMove.id
          });
          
          await configurationService.createSubjectDimension(
          destinationDimensionId,
          subjectToMove.id
          );
          
          fetchDimensionsWithSubjects();
          fetchAllSubjects();
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Materia asignada correctamente'
          });
        } catch (error) {
          console.error("Error al asignar materia:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo asignar la materia'
          });
        }
      }
    }
    // Caso 3: Mover de una dimensión a no asignadas (eliminar relación)
    else if (isFromDimension && isToUnassigned) {
      const sourceDimensionId = parseInt(sourceId.split('-')[1]);
      const subjectToMove = groupedDimensions[sourceDimensionId].subjects[result.source.index];
      const sourceDimension = groupedDimensions[sourceDimensionId].dimension;
      
      console.log("Unassigning subject from dimension:", subjectToMove);
      
      // Mostrar confirmación
      const confirmResult = await Swal.fire({
        title: '¿Desasignar materia?',
        html: `¿Estás seguro de desasignar <strong>${subjectToMove.subjectName}</strong> de la dimensión <strong>${sourceDimension.name}</strong>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, desasignar',
        cancelButtonText: 'Cancelar'
      });
      
      if (confirmResult.isConfirmed) {
        try {
          console.log("Calling API to delete subject dimension:", subjectToMove.relationId);
          
          await configurationService.deleteSubjectDimension(subjectToMove.relationId);
          
          fetchDimensionsWithSubjects();
          fetchAllSubjects();
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Materia desasignada correctamente'
          });
        } catch (error) {
          console.error("Error al desasignar materia:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo desasignar la materia'
          });
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón Crear Dimensión */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCreateDimension}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Crear dimensión
        </button>
      </div>

      {/* Contenedor principal para arrastrar y soltar */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Cargando...</span>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel izquierdo: Dimensiones */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold mb-4">Dimensiones</h2>
              
              {Object.values(groupedDimensions).length > 0 ? (
                Object.values(groupedDimensions).map((item) => (
                  <div
                    key={item.dimension.id}
                    className="bg-white rounded-lg overflow-hidden shadow border border-gray-200"
                  >
                    {/* Cabecera de dimensión */}
                    <div
                      className={`p-4 flex justify-between items-center cursor-pointer ${
                        expandedDimensions[item.dimension.id] ? "bg-yellow-50" : "bg-white"
                      }`}
                      onClick={() => toggleDimension(item.dimension.id)}
                    >
                      <div className="flex items-center">
                        {expandedDimensions[item.dimension.id] ? (
                          <ChevronUp className="h-5 w-5 mr-2 text-yellow-500" />
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
                            handleEditDimension(item.dimension);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Editar dimensión"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDimension(item.dimension.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Eliminar dimensión"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lista de materias */}
                    {expandedDimensions[item.dimension.id] && (
                      <Droppable droppableId={`dimension-${item.dimension.id}`}>
                        {(provided, snapshot) => (
                          <div 
                            className={`p-4 min-h-[100px] ${snapshot.isDraggingOver ? 'bg-yellow-100' : 'bg-yellow-50'}`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {item.subjects.length > 0 ? (
                              <ul className="space-y-2">
                                {item.subjects.map((subject, index) => (
                                  <Draggable 
                                    key={`${subject.id}-${subject.relationId}`} 
                                    draggableId={`subject-${subject.id}-${subject.relationId}`} 
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`flex justify-between items-center p-3 rounded-md shadow-sm border transition-shadow duration-200 cursor-grab active:cursor-grabbing ${
                                          snapshot.isDragging ? 'bg-blue-50 shadow-md border-blue-300' : 'bg-white border-gray-200'
                                        }`}
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
                                        <div className="flex items-center">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteRelation(subject.relationId);
                                            }}
                                            className="p-1 hover:bg-red-100 rounded mr-2"
                                            title="Eliminar relación"
                                          >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                          </button>
                                          <Move className="h-4 w-4 text-gray-400" />
                                        </div>
                                      </li>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </ul>
                            ) : (
                              <div className="text-center text-gray-500 py-4 border-2 border-dashed border-gray-300 rounded-md">
                                <p>Arrastra materias aquí</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No hay dimensiones disponibles.</p>
                </div>
              )}
            </div>
            
            {/* Panel derecho: Materias no asignadas */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg overflow-hidden shadow border border-gray-200">
                <div className="p-4 bg-gray-50">
                  <h2 className="text-xl font-bold">Materias no asignadas</h2>
                  <p className="text-sm text-gray-500">Arrastra materias hacia las dimensiones para asignarlas</p>
                </div>
                
                <Droppable droppableId="unassigned-subjects">
                  {(provided, snapshot) => (
                    <div 
                      className={`p-4 min-h-[300px] ${snapshot.isDraggingOver ? 'bg-gray-100' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {unassignedSubjects.length > 0 ? (
                        <ul className="space-y-2">
                          {unassignedSubjects.map((subject, index) => (
                            <Draggable 
                              key={`unassigned-${subject.id}`} 
                              draggableId={`unassigned-${subject.id}`} 
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <li
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex justify-between items-center p-3 rounded-md shadow-sm border transition-shadow duration-200 cursor-grab active:cursor-grabbing ${
                                    snapshot.isDragging ? 'bg-green-50 shadow-md border-green-300' : 'bg-gray-50 border-gray-200'
                                  }`}
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
                                  <Move className="h-4 w-4 text-gray-400" />
                                </li>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </ul>
                      ) : (
                        <div className="text-center text-gray-500 py-4 border-2 border-dashed border-gray-300 rounded-md">
                          <p>No hay materias sin asignar</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default AreasTab;
