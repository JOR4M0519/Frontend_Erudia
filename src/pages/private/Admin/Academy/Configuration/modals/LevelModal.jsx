import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const LevelModal = ({ level, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    levelName: "",
    status: "A"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (level) {
      setFormData({
        levelName: level.levelName || "",
        status: level.status || "A"
      });
    } else {
      // Reset form cuando se está creando un nuevo nivel
      setFormData({
        levelName: "",
        status: "A"
      });
    }
  }, [level]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.levelName.trim()) {
      newErrors.levelName = "El nombre del nivel es obligatorio";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            {level ? "Editar Nivel Académico" : "Nuevo Nivel Académico"}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="levelName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Nivel*
              </label>
              <input
                type="text"
                id="levelName"
                name="levelName"
                value={formData.levelName}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.levelName ? "border-red-500" : ""
                }`}
                placeholder="Ej. Maternal, Preescolar, Primaria..."
              />
              {errors.levelName && (
                <p className="mt-1 text-sm text-red-600">{errors.levelName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {level ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LevelModal;
