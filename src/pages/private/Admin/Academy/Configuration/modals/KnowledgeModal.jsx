import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const KnowledgeModal = ({ knowledge, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    percentage: 0,
    status: "A"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (knowledge) {
      setFormData({
        name: knowledge.name || "",
        percentage: knowledge.percentage || 0,
        status: knowledge.status || "A"
      });
    } else {
      // Reset form cuando se está creando un nuevo saber
      setFormData({
        name: "",
        percentage: 0,
        status: "A"
      });
    }
  }, [knowledge]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Para el campo de porcentaje, convertir a número
    if (name === "percentage") {
      const numValue = parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
    
    if (!formData.name.trim()) {
      newErrors.name = "El nombre del saber es obligatorio";
    }
    
    if (formData.percentage < 0 || formData.percentage > 100) {
      newErrors.percentage = "El porcentaje debe estar entre 0 y 100";
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
            {knowledge ? "Editar Saber" : "Nuevo Saber"}
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Saber*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-500" : ""
                }`}
                placeholder="Ej. SER, HACER, CONOCER..."
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje (%)*
              </label>
              <input
                type="number"
                id="percentage"
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                min="0"
                max="100"
                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.percentage ? "border-red-500" : ""
                }`}
              />
              {errors.percentage && (
                <p className="mt-1 text-sm text-red-600">{errors.percentage}</p>
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
              {knowledge ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeModal;
