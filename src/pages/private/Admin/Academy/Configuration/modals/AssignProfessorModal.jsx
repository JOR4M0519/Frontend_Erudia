import React, { useState, useEffect } from "react";
import { X, Check, User, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import configurationService from "../configurationService";

const AssignProfessorModal = ({ isOpen, onClose, onSave }) => {
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Cargar materias
      const subjectsData = await configurationService.getSubjects();
      setSubjects(subjectsData.filter(subject => subject.status === "A"));
      
      // Cargar profesores (usuarios administrativos)
      const professorsData = await configurationService.getAdministrativeUsers();
      setProfessors(professorsData.filter(user => user.status === "A"));
      
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos necesarios");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSubject || !selectedProfessor) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);
      
      const subjectProfessorData = {
        subject: {
          id: parseInt(selectedSubject)
        },
        professor: {
          id: parseInt(selectedProfessor)
        }
      };
      
      await onSave(subjectProfessorData);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error("Error al asignar profesor:", err);
      setError("Error al asignar el profesor a la materia");
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
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Asignar Profesor a Materia
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materia *
            </label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 pl-10"
                required
              >
                <option value="">Seleccione una materia</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
              <BookOpen size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profesor *
            </label>
            <div className="relative">
              <select
                value={selectedProfessor}
                onChange={(e) => setSelectedProfessor(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 pl-10"
                required
              >
                <option value="">Seleccione un profesor</option>
                {professors.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.firstName} {professor.lastName} ({professor.username})
                  </option>
                ))}
              </select>
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              ) : (
                <Check size={18} className="mr-2" />
              )}
              Asignar Profesor
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AssignProfessorModal;
