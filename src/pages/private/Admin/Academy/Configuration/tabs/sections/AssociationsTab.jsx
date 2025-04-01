import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Search, Copy, Trash2, Move, Eye } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Swal from "sweetalert2";
import { configurationService } from "../../";

const AssociationsTab = ({
  subjectKnowledges,
  allKnowledges,
  uniqueSubjects,
  showFilters,
  editMode = false,
  onSubjectKnowledgeUpdated
}) => {
  // Estados para filtros
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [knowledgeFilter, setKnowledgeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Estado para asociaciones agrupadas por materia
  const [groupedAssociations, setGroupedAssociations] = useState({});

  // Estado para controlar qué materias están expandidas
  const [expandedSubjects, setExpandedSubjects] = useState({});

  // Estado para controlar carga y operaciones
  const [loading, setLoading] = useState(false);

  // Estado para mostrar panel lateral de saberes disponibles
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(editMode);

  // Estado para saberes disponibles (filtrados)
  const [availableKnowledges, setAvailableKnowledges] = useState([]);

  // Estado para búsqueda en panel de saberes
  const [knowledgeSearchTerm, setKnowledgeSearchTerm] = useState("");

  // Actualizar showKnowledgePanel cuando cambia editMode
  useEffect(() => {
    setShowKnowledgePanel(editMode);
  }, [editMode]);

  // Agrupar asociaciones por materia cuando cambian los datos o filtros
  useEffect(() => {
    groupAssociationsBySubject();
  }, [subjectKnowledges, subjectSearchTerm, knowledgeFilter, statusFilter]);

  // Filtrar saberes disponibles para el panel lateral
  useEffect(() => {
    const filtered = allKnowledges.filter(knowledge =>
      knowledge.name.toLowerCase().includes(knowledgeSearchTerm.toLowerCase())
    );
    setAvailableKnowledges(filtered);
  }, [allKnowledges, knowledgeSearchTerm]);

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

      // Agregar el saber con su ID de asociación para poder eliminarlo después
      grouped[subjectId].knowledges.push({
        id: item.idKnowledge.id,
        associationId: item.id, // ID de la relación para eliminar/actualizar
        name: item.idKnowledge.name,
        percentage: item.idKnowledge.percentage,
        status: item.idKnowledge.status
      });
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
    setKnowledgeSearchTerm("");
  };

  // Verificar si un saber ya está asociado a una materia
  const isKnowledgeAssociatedWithSubject = (knowledgeId, subjectId) => {
    if (!groupedAssociations[subjectId]) return false;

    return groupedAssociations[subjectId].knowledges.some(
      knowledge => knowledge.id === knowledgeId
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

      // Caso 1: Arrastrar desde el panel de saberes a una materia
      if (source.droppableId === "knowledges-panel" &&
        destination.droppableId.startsWith("subject-")) {

        const subjectId = parseInt(destination.droppableId.split("-")[1]);
        const knowledgeId = parseInt(availableKnowledges[source.index].id);

        // Verificar si el saber ya está asociado a esta materia
        if (isKnowledgeAssociatedWithSubject(knowledgeId, subjectId)) {
          Swal.fire({
            icon: "warning",
            title: "Duplicado",
            text: "Este saber ya está asociado a esta materia"
          });
          return;
        }

        // Crear nueva asociación
        const newAssociation = {
          idSubject: { id: subjectId },
          idKnowledge: { id: knowledgeId }
        };

        await configurationService.createSubjectKnowledge(newAssociation);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Asociación creada",
          text: "El saber se ha asociado correctamente a la materia",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });

        // Notificar al componente padre para actualizar los datos
        if (onSubjectKnowledgeUpdated) {
          onSubjectKnowledgeUpdated();
        } else {
          // Si no hay callback, actualizar localmente
          const updatedSubjectKnowledges = await configurationService.getSubjectKnowledge();
          groupAssociationsBySubject();
        }
      }

      // Caso 2: Mover un saber de una materia a otra
      else if (source.droppableId.startsWith("subject-") &&
        destination.droppableId.startsWith("subject-") &&
        source.droppableId !== destination.droppableId) {

        const sourceSubjectId = parseInt(source.droppableId.split("-")[1]);
        const destSubjectId = parseInt(destination.droppableId.split("-")[1]);

        const knowledgeToMove = groupedAssociations[sourceSubjectId].knowledges[source.index];

        // Verificar si el saber ya está asociado a la materia destino
        if (isKnowledgeAssociatedWithSubject(knowledgeToMove.id, destSubjectId)) {
          Swal.fire({
            icon: "warning",
            title: "Duplicado",
            text: "Este saber ya está asociado a la materia destino"
          });
          return;
        }

        // Eliminar la asociación anterior
        await configurationService.deleteSubjectKnowledge(knowledgeToMove.associationId);

        // Crear nueva asociación con la materia destino
        const newAssociation = {
          idSubject: { id: destSubjectId },
          idKnowledge: { id: knowledgeToMove.id }
        };

        await configurationService.createSubjectKnowledge(newAssociation);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Saber movido",
          text: "El saber se ha movido correctamente a la nueva materia",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });

        // Notificar al componente padre para actualizar los datos
        if (onSubjectKnowledgeUpdated) {
          onSubjectKnowledgeUpdated();
        } else {
          // Si no hay callback, actualizar localmente
          const updatedSubjectKnowledges = await configurationService.getSubjectKnowledge();
          groupAssociationsBySubject();
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

  // Eliminar una asociación de saber-materia
  const handleDeleteAssociation = async (associationId) => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará la asociación entre el saber y la materia",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        setLoading(true);
        await configurationService.deleteSubjectKnowledge(associationId);

        // Notificar al componente padre para actualizar los datos
        if (onSubjectKnowledgeUpdated) {
          onSubjectKnowledgeUpdated();
        } else {
          // Si no hay callback, actualizar localmente
          const updatedSubjectKnowledges = await configurationService.getSubjectKnowledge();
          groupAssociationsBySubject();
        }

        Swal.fire(
          "Eliminado",
          "La asociación ha sido eliminada correctamente",
          "success"
        );
      }
    } catch (error) {
      console.error("Error al eliminar asociación:", error);

      // Manejar los diferentes tipos de errores según el código HTTP
      if (error.response) {
        const { status, data } = error.response;

        if (status === 409) { // HttpStatus.CONFLICT
          // El saber está siendo utilizado en logros o evaluaciones
          Swal.fire({
            icon: "error",
            title: "No se puede eliminar",
            text: data || "Este saber está siendo utilizado en logros o evaluaciones"
          });
        } else if (status === 404) { // HttpStatus.NOT_FOUND
          // La asociación no existe
          Swal.fire({
            icon: "warning",
            title: "Asociación no encontrada",
            text: data || "La asociación que intentas eliminar no existe"
          });
        } else {
          // Otros errores del servidor
          Swal.fire({
            icon: "error",
            title: "Error del servidor",
            text: "Ocurrió un problema al procesar la solicitud"
          });
        }
      } else {
        // Error de red u otro tipo de error
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor. Verifica tu conexión a internet."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Copiar saberes de una materia a otra
  const handleCopyKnowledges = async (sourceSubjectId) => {
    try {
      // Obtener la lista de materias sin la materia origen
      const otherSubjects = uniqueSubjects.filter(
        subject => subject.id !== sourceSubjectId
      );

      if (otherSubjects.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No hay otras materias",
          text: "No hay otras materias disponibles para copiar los saberes"
        });
        return;
      }

      // Crear opciones para el select
      const options = otherSubjects.map(subject => ({
        value: subject.id,
        text: subject.subjectName
      }));

      // Mostrar modal para seleccionar la materia destino
      const { value: destSubjectId } = await Swal.fire({
        title: "Copiar saberes a otra materia",
        input: "select",
        inputOptions: options.reduce((acc, opt) => {
          acc[opt.value] = opt.text;
          return acc;
        }, {}),
        inputPlaceholder: "Selecciona una materia",
        showCancelButton: true,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value) {
              resolve();
            } else {
              resolve("Debes seleccionar una materia");
            }
          });
        }
      });

      if (destSubjectId) {
        setLoading(true);

        // Obtener los saberes de la materia origen
        const sourceKnowledges = groupedAssociations[sourceSubjectId].knowledges;

        // Filtrar saberes que ya están en la materia destino
        const knowledgesToCopy = sourceKnowledges.filter(
          knowledge => !isKnowledgeAssociatedWithSubject(knowledge.id, parseInt(destSubjectId))
        );

        if (knowledgesToCopy.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin saberes para copiar",
            text: "Todos los saberes ya están asociados a la materia destino"
          });
          setLoading(false);
          return;
        }

        // Crear nuevas asociaciones para cada saber
        const promises = knowledgesToCopy.map(knowledge => {
          const newAssociation = {
            idSubject: { id: parseInt(destSubjectId) },
            idKnowledge: { id: knowledge.id }
          };

          return configurationService.createSubjectKnowledge(newAssociation);
        });

        await Promise.all(promises);

        // Notificar al componente padre para actualizar los datos
        if (onSubjectKnowledgeUpdated) {
          onSubjectKnowledgeUpdated();
        } else {
          // Si no hay callback, actualizar localmente
          const updatedSubjectKnowledges = await configurationService.getSubjectKnowledge();
          groupAssociationsBySubject();
        }

        Swal.fire(
          "Copiado",
          `Se han copiado ${knowledgesToCopy.length} saberes a la materia seleccionada`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error al copiar saberes:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron copiar los saberes"
      });
    } finally {
      setLoading(false);
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

  // Renderizado condicional basado en el modo de edición
  const renderContent = () => {
    if (editMode) {
      return (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Panel lateral de saberes disponibles */}
            <div className={`lg:w-1/4 bg-white rounded-lg shadow p-4 ${showKnowledgePanel ? 'block' : 'hidden lg:block'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Saberes Disponibles</h3>
                <button
                  onClick={() => setShowKnowledgePanel(!showKnowledgePanel)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={knowledgeSearchTerm}
                    onChange={(e) => setKnowledgeSearchTerm(e.target.value)}
                    placeholder="Buscar saberes..."
                    className="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Droppable droppableId="knowledges-panel">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-50 p-2 rounded-md min-h-[400px] max-h-[600px] overflow-y-auto"
                  >
                    {availableKnowledges.map((knowledge, index) => (
                      <Draggable
                        key={`knowledge-${knowledge.id}`}
                        draggableId={`knowledge-${knowledge.id}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-2 rounded-md ${snapshot.isDragging
                                ? "bg-blue-100 shadow-lg"
                                : "bg-white shadow-sm"
                              } hover:bg-blue-50 transition-colors`}
                          >
                            <div className="flex items-center">
                              <div className="mr-2 text-blue-500">
                                <Move size={16} />
                              </div>
                              <div>
                                <div className="font-medium">{knowledge.name}</div>
                                <div className="text-sm text-gray-500">
                                  Porcentaje: {knowledge.percentage}%
                                </div>
                                <div className="mt-1">
                                  {getStatusBadge(knowledge.status)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {availableKnowledges.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No se encontraron saberes
                      </div>
                    )}
                  </div>
                )}
              </Droppable>

              <div className="mt-4 text-sm text-gray-500">
                <p>Arrastra los saberes a las materias para asociarlos</p>
              </div>
            </div>

            {/* Contenido principal (asociaciones) */}
            <div className="lg:w-3/4">
              {/* Filtros para asociaciones */}
              {showFilters && (
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

                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => setShowKnowledgePanel(!showKnowledgePanel)}
                      className="lg:hidden flex items-center gap-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded transition-colors"
                    >
                      {showKnowledgePanel ? 'Ocultar saberes' : 'Mostrar saberes'}
                    </button>

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
                        className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${expandedSubjects[group.subject.id] ? "bg-amber-100" : "hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center" onClick={() => toggleSubject(group.subject.id)}>
                          <h3 className="font-medium text-lg">{group.subject.subjectName}</h3>
                          <span className="ml-2 text-sm text-gray-500">
                            {group.knowledges.length} saberes asociados
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {editMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyKnowledges(group.subject.id);
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title="Copiar saberes a otra materia"
                            >
                              <Copy size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => toggleSubject(group.subject.id)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            {expandedSubjects[group.subject.id] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Contenido del acordeón */}
                      {expandedSubjects[group.subject.id] && (
                        <Droppable droppableId={`subject-${group.subject.id}`} isDropDisabled={!editMode}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="p-4 bg-gray-50"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.knowledges.map((knowledge, index) => (
                                  <Draggable
                                    key={`subject-${group.subject.id}-knowledge-${knowledge.id}`}
                                    draggableId={`subject-${group.subject.id}-knowledge-${knowledge.id}`}
                                    index={index}
                                    isDragDisabled={!editMode}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`p-4 rounded-md ${snapshot.isDragging
                                            ? "bg-amber-100 shadow-lg"
                                            : "bg-white shadow-sm"
                                          } hover:bg-amber-50 transition-colors`}
                                      >
                                        <div className="flex justify-between">
                                          {editMode ? (
                                            <div
                                              {...provided.dragHandleProps}
                                              className="cursor-grab flex items-center text-amber-500"
                                            >
                                              <Move size={18} />
                                            </div>
                                          ) : (
                                            <div className="flex items-center text-amber-500">
                                              <Eye size={18} />
                                            </div>
                                          )}
                                          {editMode && (
                                            <button
                                              onClick={() => handleDeleteAssociation(knowledge.associationId)}
                                              className="text-gray-400 hover:text-red-500 transition-colors"
                                              title="Eliminar asociación"
                                            >
                                              <Trash2 size={18} />
                                            </button>
                                          )}
                                        </div>
                                        <div className="mt-2">
                                          <div className="font-medium">{knowledge.name}</div>
                                          <div className="text-sm text-gray-500">
                                            Porcentaje: {knowledge.percentage}%
                                          </div>
                                          <div className="mt-2">
                                            {getStatusBadge(knowledge.status)}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                              {provided.placeholder}
                              {group.knowledges.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                  No hay saberes asociados a esta materia
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Overlay de carga */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span>Procesando...</span>
                </div>
              </div>
            </div>
          )}
        </DragDropContext>
      );
    } else {
      // Modo de visualización (sin arrastre)
      return (
        <div className="flex flex-col gap-4">
          {/* Filtros para asociaciones */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow p-4 mb-2">
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
          )}

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
                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${expandedSubjects[group.subject.id] ? "bg-amber-100" : "hover:bg-gray-50"
                      }`}
                    onClick={() => toggleSubject(group.subject.id)}
                  >
                    <div className="flex items-center">
                      <h3 className="font-medium text-lg">{group.subject.subjectName}</h3>
                      <span className="ml-2 text-sm text-gray-500">
                        {group.knowledges.length} saberes asociados
                      </span>
                    </div>
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {expandedSubjects[group.subject.id] ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Contenido del acordeón */}
                  {expandedSubjects[group.subject.id] && (
                    <div className="p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.knowledges.map((knowledge) => (
                          <div
                            key={`view-subject-${group.subject.id}-knowledge-${knowledge.id}`}
                            className="p-4 rounded-md bg-white shadow-sm hover:bg-amber-50 transition-colors"
                          >
                            <div className="mt-2">
                              <div className="font-medium">{knowledge.name}</div>
                              <div className="text-sm text-gray-500">
                                Porcentaje: {knowledge.percentage}%
                              </div>
                              <div className="mt-2">
                                {getStatusBadge(knowledge.status)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {group.knowledges.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No hay saberes asociados a esta materia
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  return renderContent();
};

export default AssociationsTab;
