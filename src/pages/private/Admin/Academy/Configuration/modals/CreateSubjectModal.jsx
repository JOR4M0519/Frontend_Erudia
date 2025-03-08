// CreateSubjectModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

const CreateSubjectModal = ({ dimension, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    course: "",
    teacher: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Datos de ejemplo para las listas desplegables
  const niveles = ["Preescolar", "Primaria", "Secundaria", "Bachillerato"];
  const cursos = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"];
  const profesores = ["Ana García", "Carlos Rodríguez", "María López", "Juan Martínez", "Laura Sánchez"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error al guardar la materia:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Crear materia</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="subject-name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la materia
            </label>
            <input
              id="subject-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
              placeholder="Ej: Matemáticas"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
              Nivel escolar
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer transition-all duration-200"
              required
            >
              <option value="" disabled>Selecciona un nivel</option>
              {niveles.map(nivel => (
                <option key={nivel} value={nivel}>{nivel}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
              Curso/Grupo
            </label>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer transition-all duration-200"
              required
            >
              <option value="" disabled>Selecciona un curso</option>
              {cursos.map(curso => (
                <option key={curso} value={curso}>{curso}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-2">
              Profesor
            </label>
            <select
              id="teacher"
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer transition-all duration-200"
              required
            >
              <option value="" disabled>Selecciona un profesor</option>
              {profesores.map(profesor => (
                <option key={profesor} value={profesor}>{profesor}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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

export default CreateSubjectModal;
