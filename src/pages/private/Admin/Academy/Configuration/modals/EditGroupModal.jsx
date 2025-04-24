import React, { useState, useEffect } from "react";
import { X, School, Hash, Type, User, ToggleLeft } from "lucide-react";
import { motion } from "framer-motion";

const EditGroupModal = ({ isOpen, onClose, group, level, professors, onSave }) => {
  const [formData, setFormData] = useState({
    groupCode: "",
    groupName: "",
    mentorId: "",
    levelId: level?.id || null,
    status: "A" // Valor predeterminado es Activo
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos del grupo al iniciar
  useEffect(() => {
    if (isOpen && group) {
      setFormData({
        groupCode: group.groupCode || "",
        groupName: group.groupName || "",
        mentorId: group.mentor?.id || "",
        levelId: group.level?.id || level?.id || null,
        status: group.status || "A" // Si no tiene status, se asume Activo
      });
    }
  }, [isOpen, group, level]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Limpiar errores al cambiar un campo
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.groupCode) {
      newErrors.groupCode = "El código de grupo es obligatorio";
    }
    
    if (!formData.groupName) {
      newErrors.groupName = "El nombre de grupo es obligatorio";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Construir objeto de datos para actualización
      const groupData = {
        ...formData,
        id: group.id,
        level: {
          id: formData.levelId
        },
        mentor: formData.mentorId ? { id: formData.mentorId } : null,
        status: formData.status // Incluir el status en los datos de grupo
      };
      
      await onSave(group.id, groupData);
      setLoading(false);
      onClose();
    } catch (error) {
      setLoading(false);
      console.error("Error al actualizar grupo:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <School className="text-blue-600 mr-2" size={20} />
            Editar Grupo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Hash size={16} className="inline mr-1 text-gray-500" />
              Código del Grupo
            </label>
            <input
              type="text"
              name="groupCode"
              value={formData.groupCode}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.groupCode ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.groupCode && (
              <p className="mt-1 text-sm text-red-600">{errors.groupCode}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Type size={16} className="inline mr-1 text-blue-500" />
              Nombre del Grupo
            </label>
            <input
              type="text"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.groupName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.groupName && (
              <p className="mt-1 text-sm text-red-600">{errors.groupName}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="inline mr-1 text-amber-500" />
              Director de Grupo
            </label>
            <select
              name="mentorId"
              value={formData.mentorId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">No asignado</option>
              {professors?.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.firstName} {professor.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de estado (status) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <ToggleLeft size={16} className="inline mr-1 text-green-500" />
              Estado del Grupo
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditGroupModal;