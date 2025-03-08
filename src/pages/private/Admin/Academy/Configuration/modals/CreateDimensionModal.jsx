// CreateDimensionModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

const CreateDimensionModal = ({ onClose, onSave }) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSave({ name });
      onClose();
    } catch (error) {
      console.error("Error al guardar la dimensión:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Crear dimensión</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="dimension-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la dimensión
            </label>
            <input
              id="dimension-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              placeholder="Ej: Dimensión socioafectiva"
              required
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-2"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDimensionModal;
