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
  const [errors, setErrors] = useState({});

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
        minimum_grade: schema.minimumGrade || 1,
        pass_grade: schema.passGrade || 3,
        maximum_grade: schema.maximumGrade || 5,
        level_id: schema.educationalLevel?.id || ""
      });
    }
  }, [schema]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('grade') ? parseFloat(value) : value
    }));
    
    // Limpiar error del campo cuando cambia
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    
    if (!formData.level_id) {
      newErrors.level_id = "El nivel educativo es obligatorio";
    }
    
    if (formData.minimum_grade >= formData.pass_grade) {
      newErrors.minimum_grade = "La nota mínima debe ser menor que la nota de aprobación";
    }
    
    if (formData.pass_grade >= formData.maximum_grade) {
      newErrors.pass_grade = "La nota de aprobación debe ser menor que la nota máxima";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Formatear los datos según el formato esperado por el backend
    const gradeSettingData = {
      name: formData.name,
      description: formData.description,
      minimumGrade: formData.minimum_grade,
      passGrade: formData.pass_grade,
      maximumGrade: formData.maximum_grade,
      levelId: parseInt(formData.level_id)
    };
    
    onSave(gradeSettingData);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {schema ? "Editar esquema de calificación" : "Crear esquema de calificación"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ej. Esquema de calificación primaria"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción del esquema de calificación"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nota mínima *
              </label>
              <input
                type="number"
                name="minimum_grade"
                value={formData.minimum_grade}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.minimum_grade ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.minimum_grade && (
                <p className="mt-1 text-sm text-red-600">{errors.minimum_grade}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nota de aprobación *
              </label>
              <input
                type="number"
                name="pass_grade"
                value={formData.pass_grade}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pass_grade ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.pass_grade && (
                <p className="mt-1 text-sm text-red-600">{errors.pass_grade}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nota máxima *
              </label>
              <input
                type="number"
                name="maximum_grade"
                value={formData.maximum_grade}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.maximum_grade ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.maximum_grade && (
                <p className="mt-1 text-sm text-red-600">{errors.maximum_grade}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel educativo *
            </label>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : (
              <select
                name="level_id"
                value={formData.level_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.level_id ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Seleccionar nivel educativo</option>
                {educationalLevels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.levelName}
                  </option>
                ))}
              </select>
            )}
            {errors.level_id && (
              <p className="mt-1 text-sm text-red-600">{errors.level_id}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {schema ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchemaForm;
