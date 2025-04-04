import React, { useState, useEffect } from "react";
import { X, Check, BookOpen, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { configurationService } from "../";

const CreateSubjectModal = ({ isOpen, onClose, onSave }) => {
  const [subjectName, setSubjectName] = useState("");
  const [dimensions, setDimensions] = useState([]);
  const [selectedDimension, setSelectedDimension] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDimensions, setLoadingDimensions] = useState(false);
  const [error, setError] = useState(null);

  // Cargar las dimensiones al abrir el modal
  useEffect(() => {
    const fetchDimensions = async () => {
      if (isOpen) {
        try {
          setLoadingDimensions(true);
          const dimensionsData = await configurationService.getDimensions();
          setDimensions(dimensionsData);
          
          // Seleccionar la primera dimensión por defecto si existe
          if (dimensionsData.length > 0) {
            setSelectedDimension(dimensionsData[0].id.toString());
          }
          
          setLoadingDimensions(false);
        } catch (err) {
          console.error("Error al cargar dimensiones:", err);
          setError("No se pudieron cargar las dimensiones");
          setLoadingDimensions(false);
        }
      }
    };
    
    fetchDimensions();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subjectName.trim()) {
      setError("El nombre de la materia es obligatorio");
      return;
    }

    if (!selectedDimension) {
      setError("Debe seleccionar una dimensión");
      return;
    }

    try {
      setLoading(true);
      
      // 1. Crear la materia
      const subjectData = {
        subjectName: subjectName,
        status: "A"
      };
      
      const newSubject = await onSave(subjectData);
      console.log(newSubject)
      // 2. Crear la relación Subject-Dimension
      await configurationService.createSubjectDimension(
        parseInt(selectedDimension),
        newSubject.id
      );
      
      setLoading(false);
      setSubjectName("");
      setSelectedDimension("");
      onClose();
    } catch (err) {
      console.error("Error al crear materia o asociarla a dimensión:", err);
      setError("Error al crear la materia o asociarla a la dimensión");
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
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <BookOpen size={20} className="mr-2 text-amber-500" />
            Crear Nueva Materia
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
              Nombre de la Materia *
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              placeholder="Ej: Matemáticas Avanzadas"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dimensión *
            </label>
            {loadingDimensions ? (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-500"></div>
                <span>Cargando dimensiones...</span>
              </div>
            ) : dimensions.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 flex items-center">
                <AlertCircle size={16} className="mr-2" />
                <span className="text-sm">No hay dimensiones disponibles</span>
              </div>
            ) : (
              <select
                value={selectedDimension}
                onChange={(e) => setSelectedDimension(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                required
              >
                <option value="">Seleccione una dimensión</option>
                {dimensions.map((dimension) => (
                  <option key={dimension.id} value={dimension.id}>
                    {dimension.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <AlertCircle size={16} className="mr-2" />
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
              disabled={loading || loadingDimensions || dimensions.length === 0}
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              ) : (
                <Check size={18} className="mr-2" />
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
