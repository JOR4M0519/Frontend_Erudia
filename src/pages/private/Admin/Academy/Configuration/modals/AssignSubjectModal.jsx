import React, { useState, useEffect } from "react";
import { X, Check, Book, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import configurationService from "../configurationService";

const AssignSubjectModal = ({ isOpen, onClose, group, onSave, selectedPeriodId }) => {
  const [subjectProfessors, setSubjectProfessors] = useState([]);
  const [availableSubjectProfessors, setAvailableSubjectProfessors] = useState([]);
  const [assignedSubjectProfessors, setAssignedSubjectProfessors] = useState([]);
  const [selectedSubjectProfessor, setSelectedSubjectProfessor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, selectedPeriodId, group]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar todas las materias con profesores
      const subjectProfessorsData = await configurationService.getSubjectProfessors();
      setSubjectProfessors(subjectProfessorsData);
      
      // Cargar materias ya asignadas a este grupo en este periodo
      const assignedSubjectsData = await configurationService.getAllSubjectGroupsByPeriodAndGroup(
        selectedPeriodId, 
        group.id
      );
      
      // Crear un conjunto de IDs de materias-profesor ya asignadas
      const assignedSubjectProfessorIds = new Set(
        assignedSubjectsData.map(item => item.subjectProfessor.id)
      );
      
      // Separar materias disponibles y asignadas
      const assigned = [];
      const available = [];
      
      subjectProfessorsData.forEach(sp => {
        if (assignedSubjectProfessorIds.has(sp.id)) {
          assigned.push(sp);
        } else {
          available.push(sp);
        }
      });
      
      setAssignedSubjectProfessors(assigned);
      setAvailableSubjectProfessors(available);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos necesarios");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSubjectProfessor) {
      setError("Debe seleccionar una materia y profesor");
      return;
    }

    if (!selectedPeriodId) {
      setError("No hay periodo académico seleccionado en los filtros");
      return;
    }

    try {
      setLoading(true);
      
      const subjectGroupData = {
        subjectProfessor: {
          id: parseInt(selectedSubjectProfessor)
        },
        groups: {
          id: group.id
        },
        academicPeriod: {
          id: parseInt(selectedPeriodId)
        }
      };
      
      await onSave(subjectGroupData);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error("Error al asignar materia:", err);
      setError("Error al asignar la materia al grupo");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50  flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Asignar Materia - {group.groupName}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materia y Profesor *
                </label>
                <div className="relative">
                  <select
                    value={selectedSubjectProfessor}
                    onChange={(e) => setSelectedSubjectProfessor(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 pl-10"
                    required
                  >
                    <option value="">Seleccione una materia</option>
                    
                    {/* Grupo de materias disponibles */}
                    {availableSubjectProfessors.length > 0 && (
                      <optgroup label="Materias disponibles">
                        {availableSubjectProfessors.map((sp) => (
                          <option key={`available-${sp.id}`} value={sp.id}>
                            {sp.subject.subjectName} - Prof. {sp.professor.firstName} {sp.professor.lastName}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    
                    {/* Grupo de materias ya asignadas */}
                    {assignedSubjectProfessors.length > 0 && (
                      <optgroup label="Materias ya asignadas">
                        {assignedSubjectProfessors.map((sp) => (
                          <option key={`assigned-${sp.id}`} value={sp.id} disabled className="text-gray-400">
                            {sp.subject.subjectName} - Prof. {sp.professor.firstName} {sp.professor.lastName}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    
                    {availableSubjectProfessors.length === 0 && assignedSubjectProfessors.length === 0 && (
                      <option value="" disabled>
                        No hay materias disponibles
                      </option>
                    )}
                  </select>
                  <Book size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* Mensaje informativo sobre materias asignadas */}
              {assignedSubjectProfessors.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start">
                  <Info size={18} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p>Las materias en gris ya están asignadas a este grupo para el período seleccionado.</p>
                  </div>
                </div>
              )}

              {/* Mensaje cuando no hay materias disponibles */}
              {availableSubjectProfessors.length === 0 && assignedSubjectProfessors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start">
                  <AlertCircle size={18} className="text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p>Todas las materias ya han sido asignadas a este grupo para el período seleccionado.</p>
                  </div>
                </div>
              )}

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
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
                  disabled={loading || availableSubjectProfessors.length === 0}
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  ) : (
                    <Check size={18} className="mr-2" />
                  )}
                  Asignar Materia
                </button>
              </div>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default AssignSubjectModal;
