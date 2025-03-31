import React, { useState, useEffect } from "react";
import { configurationService, SchemaForm } from "../";
import { Plus, Edit, Filter, X } from "lucide-react";
import Swal from "sweetalert2";

const SchemasTab = () => {
  const [schemas, setSchemas] = useState([]);
  const [filteredSchemas, setFilteredSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [educationalLevels, setEducationalLevels] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [levelStatusMap, setLevelStatusMap] = useState({});
  
  useEffect(() => {
    fetchSchemas();
    fetchEducationalLevels();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schemas, levelFilter, statusFilter, levelStatusMap]);

  const fetchEducationalLevels = async () => {
    try {
      const levels = await configurationService.getEducationalLevels();
      const levelsMap = {};
      const statusMap = {};
      
      for (const level of levels) {
        levelsMap[level.id] = level;
        statusMap[level.id] = level.status;
      }
      
      setEducationalLevels(levelsMap);
      setLevelStatusMap(statusMap);
    } catch (error) {
      console.error("Error al obtener niveles educativos:", error);
    }
  };

  const fetchSchemas = async () => {
    try {
      setLoading(true);
      const data = await configurationService.getGradeSettings();
      setSchemas(data);
      setFilteredSchemas(data);
    } catch (error) {
      console.error("Error al obtener esquemas de calificación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los esquemas de calificación'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...schemas];
    
    // Filtro por nivel educativo
    if (levelFilter) {
      result = result.filter(schema => schema.levelId === parseInt(levelFilter));
    }
    
    // Filtro por estado del nivel
    if (statusFilter && Object.keys(levelStatusMap).length > 0) {
      result = result.filter(schema => levelStatusMap[schema.levelId] === statusFilter);
    }
    
    setFilteredSchemas(result);
  };

  const resetFilters = () => {
    setLevelFilter("");
    setStatusFilter("");
  };

  const handleOpenModal = (schema = null) => {
    setSelectedSchema(schema);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedSchema(null);
    setShowModal(false);
  };

  const handleSaveSchema = async (schemaData) => {
    try {
      if (selectedSchema) {
        await configurationService.updateGradeSetting(selectedSchema.id, schemaData);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Esquema de calificación actualizado correctamente',
          timer: 1500
        });
      } else {
        await configurationService.createGradeSetting(schemaData);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Esquema de calificación creado correctamente',
          timer: 1500
        });
      }
      fetchSchemas();
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar esquema de calificación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el esquema de calificación'
      });
    }
  };

  const handleDeleteSchema = async (schemaId, schemaName) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el esquema "${schemaName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await configurationService.deleteGradeSetting(schemaId);
          fetchSchemas();
          Swal.fire(
            '¡Eliminado!',
            'El esquema ha sido eliminado.',
            'success'
          );
        } catch (error) {
          console.error("Error al eliminar esquema:", error);
          Swal.fire(
            'Error',
            'No se pudo eliminar el esquema',
            'error'
          );
        }
      }
    });
  };

  // Obtener lista única de niveles educativos para el filtro
  const uniqueLevels = Object.values(educationalLevels);

  return (
    <div className="w-full px-4 py-4">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div>
            <h2 className="text-lg font-medium">Esquemas de calificación</h2>
            <p className="text-sm text-gray-600 mt-2">
              Total: {loading ? "..." : filteredSchemas.length} de {schemas.length} esquemas definidos
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
            >
              <Filter size={18} />
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </button>
            
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
            >
              <Plus size={18} />
              Agregar esquema
            </button>
          </div>
        </div>
        
        {/* Sección de filtros */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Nivel Educativo</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {uniqueLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.levelName || "N/A"}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Estado Nivel Educativo</label>
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
                <X size={16} />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de esquemas */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel Educativo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rango</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota de aprobación</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <p className="mt-2 text-gray-500">Cargando esquemas...</p>
                </td>
              </tr>
            ) : filteredSchemas.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  <p className="text-gray-500">No hay esquemas que coincidan con los filtros aplicados.</p>
                </td>
              </tr>
            ) : (
              filteredSchemas.map((schema) => (
                <tr key={schema.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{schema.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {educationalLevels[schema.levelId]?.levelName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {levelStatusMap[schema.levelId] === 'A' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : levelStatusMap[schema.levelId] === 'I' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactivo
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schema.minimumGrade}-{schema.maximumGrade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schema.passGrade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleOpenModal(schema)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md px-3 py-1.5 transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteSchema(schema.id, schema.name)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-md px-3 py-1.5 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar esquema */}
      {showModal && (
        <SchemaForm
          schema={selectedSchema}
          onClose={handleCloseModal}
          onSave={handleSaveSchema}
        />
      )}
    </div>
  );
};

export default SchemasTab;
