// AreasTab.jsx
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Edit, X, Plus } from "lucide-react";
import { configurationService, CreateSubjectModal, CreateDimensionModal } from "../";

const AreasTab = () => {
  const [dimensions, setDimensions] = useState([]);
  const [expandedDimensions, setExpandedDimensions] = useState({});
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [schemaFilter, setSchemaFilter] = useState("Todos los esquemas");
  const [courseFilter, setCourseFilter] = useState("Todos");
  const [isCreateDimensionModalOpen, setIsCreateDimensionModalOpen] = useState(false);
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDimensions();
  }, [yearFilter, schemaFilter, courseFilter]);

  const fetchDimensions = async () => {
    try {
      setLoading(true);
      const data = await configurationService.getDimensions();
      setDimensions(data);
    } catch (error) {
      console.error("Error fetching dimensions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDimension = (dimensionId) => {
    setExpandedDimensions(prev => ({
      ...prev,
      [dimensionId]: !prev[dimensionId]
    }));
  };

  const handleCreateDimension = async (dimensionData) => {
    try {
      await configurationService.createDimension(dimensionData);
      fetchDimensions();
      setIsCreateDimensionModalOpen(false);
    } catch (error) {
      console.error("Error creating dimension:", error);
    }
  };

  const handleEditDimension = (dimension) => {
    // Lógica para editar dimensión
    console.log("Editar dimensión:", dimension);
  };

  const handleDeleteDimension = async (dimensionId) => {
    try {
      await configurationService.deleteDimension(dimensionId);
      fetchDimensions();
    } catch (error) {
      console.error("Error deleting dimension:", error);
    }
  };

  const handleCreateSubject = async (subjectData) => {
    try {
      await configurationService.createSubject(selectedDimension.id, subjectData);
      fetchDimensions();
      setIsCreateSubjectModalOpen(false);
      setSelectedDimension(null);
    } catch (error) {
      console.error("Error creating subject:", error);
    }
  };

  const handleOpenCreateSubjectModal = (dimension) => {
    setSelectedDimension(dimension);
    setIsCreateSubjectModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg mb-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año escolar</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 cursor-pointer"
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Esquema de calificación</label>
          <select
            value={schemaFilter}
            onChange={(e) => setSchemaFilter(e.target.value)}
            className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 cursor-pointer"
          >
            <option>Todos los esquemas</option>
            <option>Esquema 1</option>
            <option>Esquema 2</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cursos</label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 cursor-pointer"
          >
            <option>Todos</option>
            <option>Preescolar</option>
            <option>Primaria</option>
            <option>Secundaria</option>
          </select>
        </div>
      </div>

      {/* Botón Crear Dimensión mejorado */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsCreateDimensionModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus className="h-5 w-5 mr-2" />
          Crear dimensión
        </button>
      </div>

      {/* Lista de dimensiones */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Cargando dimensiones...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dimensions.map((dimension) => (
            <div 
              key={dimension.id} 
              className="bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div 
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleDimension(dimension.id)}
              >
                <div className="flex items-center">
                  {expandedDimensions[dimension.id] ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 mr-2" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <h3 className="text-lg font-semibold">{dimension.name}</h3>
                  <span className="ml-3 text-sm text-gray-500">{dimension.level || "Preescolar"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditDimension(dimension);
                    }}
                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-200 cursor-pointer hover:scale-110"
                    aria-label="Editar dimensión"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDimension(dimension.id);
                    }}
                    className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-all duration-200 cursor-pointer hover:scale-110"
                    aria-label="Eliminar dimensión"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Materias de la dimensión */}
              {expandedDimensions[dimension.id] && (
                <div className="bg-white">
                  <div className="divide-y divide-gray-100">
                    {dimension.subjects?.map((subject) => (
                      <div key={subject.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                        <span className="font-medium">{subject.name}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-200 cursor-pointer hover:scale-110"
                            aria-label="Editar materia"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-all duration-200 cursor-pointer hover:scale-110"
                            aria-label="Eliminar materia"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenCreateSubjectModal(dimension)}
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-all duration-200 cursor-pointer hover:font-medium group"
                    >
                      <Plus className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                      <span>Crear materia</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {dimensions.length === 0 && !loading && (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-500">No hay dimensiones disponibles. Crea una nueva dimensión para comenzar.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear dimensión */}
      {isCreateDimensionModalOpen && (
        <CreateDimensionModal
          onClose={() => setIsCreateDimensionModalOpen(false)}
          onSave={handleCreateDimension}
        />
      )}

      {/* Modal para crear materia */}
      {isCreateSubjectModalOpen && selectedDimension && (
        <CreateSubjectModal
          dimension={selectedDimension}
          onClose={() => {
            setIsCreateSubjectModalOpen(false);
            setSelectedDimension(null);
          }}
          onSave={handleCreateSubject}
        />
      )}
    </div>
  );
};

export default AreasTab;
