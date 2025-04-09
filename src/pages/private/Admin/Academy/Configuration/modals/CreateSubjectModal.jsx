import React, { useState, useEffect } from "react";
import { X, Check, BookOpen, AlertCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { configurationService } from "../";

const CreateSubjectModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  professors = [], 
  withProfessorAssignment = false 
}) => {
  const [subjectName, setSubjectName] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubjectName("");
      setSelectedProfessor("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subjectName.trim()) {
      setError("El nombre de la materia es obligatorio");
      return;
    }
    
    try {
      setLoading(true);
      
      // Crear la materia
      const newSubject = await configurationService.createSubject({
        subjectName: subjectName.trim(),
        status: "A"
      });
      
      // Si se seleccionó un profesor, asignarlo a la materia
      if (withProfessorAssignment && selectedProfessor) {
        await configurationService.createSubjectProfessors({
          subject: { id: newSubject.id },
          professor: { id: parseInt(selectedProfessor) }
        });
      }
      
      onSave(newSubject);
    } catch (error) {
      console.error("Error al crear materia:", error);
      setError("Ocurrió un error al crear la materia");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">Crear Nueva Materia</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md flex items-start">
              <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Materia
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="subjectName"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Ej. Matemáticas"
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {withProfessorAssignment && (
            <div className="mb-4">
              <label htmlFor="professor" className="block text-sm font-medium text-gray-700 mb-1">
                Asignar Profesor (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <select
                  id="professor"
                  value={selectedProfessor}
                  onChange={(e) => setSelectedProfessor(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar profesor (opcional)</option>
                  {professors.map((professor) => (
                    <option key={professor.id} value={professor.id}>
                      {professor.firstName} {professor.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <Check size={18} className="mr-1" />
              )}
              Crear Materia
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateSubjectModal;

