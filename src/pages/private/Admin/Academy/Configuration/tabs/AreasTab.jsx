import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Edit, X, Plus } from "lucide-react";
import { configurationService, CreateSubjectModal, CreateDimensionModal } from "../";
import Swal from "sweetalert2";

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
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState(null);
  
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
        acc[dimensionId].subjects.push(item.subject);
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

  // Editar dimensión
  const handleEditDimension = (dimension) => {
    // Implementación pendiente
    console.log("Editar dimensión:", dimension);
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

  // Crear nueva materia
  const handleCreateSubject = async (subjectData) => {
    try {
      await configurationService.createSubject(selectedDimension.id, subjectData);
      fetchDimensionsWithSubjects();
      setIsCreateSubjectModalOpen(false);
      setSelectedDimension(null);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Materia creada correctamente'
      });
    } catch (error) {
      console.error("Error al crear materia:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la materia'
      });
    }
  };

  // Abrir modal para crear materia
  const handleOpenCreateSubjectModal = (dimension) => {
    setSelectedDimension(dimension);
    setIsCreateSubjectModalOpen(true);
  };

  // Eliminar materia
  const handleDeleteSubject = async (dimensionId, subjectId) => {
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
          await configurationService.deleteSubject(dimensionId, subjectId);
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
                        handleEditDimension(item.dimension);
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
                  <div className="p-4">
                    <ul className="space-y-2">
                      {item.subjects.map((subject) => (
                        <li
                          key={subject.id}
                          className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm"
                        >
                          <span>{subject.subjectName}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSubject(item.dimension.id, subject)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(item.dimension.id, subject.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Botón para agregar materia */}
                    <button
                      onClick={() => handleOpenCreateSubjectModal(item.dimension)}
                      className="mt-4 flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Crear materia
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay dimensiones disponibles con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {isCreateDimensionModalOpen && (
        <CreateDimensionModal
          isOpen={isCreateDimensionModalOpen}
          onClose={() => setIsCreateDimensionModalOpen(false)}
          onSave={handleCreateDimension}
        />
      )}

      {isCreateSubjectModalOpen && selectedDimension && (
        <CreateSubjectModal
          isOpen={isCreateSubjectModalOpen}
          onClose={() => {
            setIsCreateSubjectModalOpen(false);
            setSelectedDimension(null);
          }}
          onSave={handleCreateSubject}
          dimension={selectedDimension}
        />
      )}
    </div>
  );
};

export default AreasTab;
