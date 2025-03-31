// SchemaForm.jsx - Componente actualizado
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { configurationService } from "../";

const SchemaForm = ({ schema, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    minimum_grade: 1,
    pass_grade: 3,
    maximum_grade: 5,
    level_id: ""  // Campo obligatorio para educational_level
  });
  
  const [educationalLevels, setEducationalLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar niveles educativos al montar el componente
  useEffect(() => {
    const fetchEducationalLevels = async () => {
      try {
        setLoading(true);
        const levels = await configurationService.getEducationalLevels();
        setEducationalLevels(levels);
        
        // Si hay niveles y no hay nivel seleccionado, seleccionar el primero por defecto
        if (levels.length > 0 && !formData.level_id) {
          setFormData(prev => ({...prev, level_id: levels[0].id}));
        }
      } catch (error) {
        console.error("Error al cargar niveles educativos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEducationalLevels();
  }, []);

  // Si se está editando un esquema existente, cargar sus datos
  useEffect(() => {
    if (schema) {
      setFormData({
        name: schema.name || "",
        description: schema.description || "",
        minimum_grade: schema.minimum_grade || 1,
        pass_grade: schema.pass_grade || 3,
        maximum_grade: schema.maximum_grade || 5,
        level_id: schema.level_id || ""
      });
    }
  }, [schema]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('grade') ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-black">
              {schema ? "Editar esquema de calificación" : "Nuevo esquema de calificación"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Nombre y Descripción */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Configuración de calificaciones */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-800 mb-3">Configuración de calificaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="minimum_grade" className="block text-sm font-medium text-gray-700 mb-1">Nota mínima</label>
                    <input
                      type="number"
                      id="minimum_grade"
                      name="minimum_grade"
                      value={formData.minimum_grade}
                      onChange={handleChange}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pass_grade" className="block text-sm font-medium text-gray-700 mb-1">Nota de aprobación</label>
                    <input
                      type="number"
                      id="pass_grade"
                      name="pass_grade"
                      value={formData.pass_grade}
                      onChange={handleChange}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="maximum_grade" className="block text-sm font-medium text-gray-700 mb-1">Nota máxima</label>
                    <input
                      type="number"
                      id="maximum_grade"
                      name="maximum_grade"
                      value={formData.maximum_grade}
                      onChange={handleChange}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

             {/* Nivel educativo */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-800 mb-3">Nivel educativo</h3>
                <div>
                  <label htmlFor="level_id" className="block text-sm font-medium text-gray-700 mb-1">Seleccione nivel</label>
                  {loading ? (
                    <div className="w-full py-2 text-gray-700">Cargando niveles...</div>
                  ) : (
                    <select
                      id="level_id"
                      name="level_id"
                      value={formData.level_id}
                      onChange={handleChange}
                      className="w-full border rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccione un nivel educativo</option>
                      {educationalLevels.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.level_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded mr-2 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-black font-medium py-2 px-4 rounded transition-colors"
              >
                Aceptar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchemaForm;
