import React, { useState, useEffect } from "react";
import { X, Check, User } from "lucide-react";
import { motion } from "framer-motion";
import configurationService from "../configurationService";

const CreateGroupModal = ({ isOpen, onClose, level, onSave }) => {
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("");
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar mentores cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchMentors();
      // Generar código sugerido basado en el nivel
      const levelPrefix = level.levelName.substring(0, 3).toUpperCase();
      setGroupCode(`${levelPrefix}-`);
    }
  }, [isOpen, level]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const adminUsers = await configurationService.getAdministrativeUsers();
      setMentors(adminUsers);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar mentores:", err);
      setError("No se pudieron cargar los mentores");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName || !groupCode || !selectedMentor) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);
      
      const groupData = {
        level: {
          id: level.id
        },
        groupCode: groupCode,
        groupName: groupName,
        mentor: {
          id: parseInt(selectedMentor)
        },
        status: "A"
      };
      
      await onSave(groupData);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error("Error al crear grupo:", err);
      setError("Error al crear el grupo");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md  bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Crear Grupo - {level.levelName}
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
              Código del Grupo *
            </label>
            <input
              type="text"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              placeholder="Ej: PRI-1A"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Grupo *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              placeholder="Ej: Primero A"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mentor *
            </label>
            <div className="relative">
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 pl-10"
                required
              >
                <option value="">Seleccione un mentor</option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.firstName} {mentor.lastName} ({mentor.username})
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
              Crear Grupo
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateGroupModal;
