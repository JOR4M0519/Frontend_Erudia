import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";

const EditSubjectModal = ({ 
  subject, 
  relationId, 
  dimensions, 
  currentDimensionId, 
  onClose, 
  onSave, 
  onChangeDimension 
}) => {
  const [subjectName, setSubjectName] = useState("");
  const [status, setStatus] = useState("A");
  const [dimensionId, setDimensionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dimensionChanged, setDimensionChanged] = useState(false);

  useEffect(() => {
    if (subject) {
      setSubjectName(subject.subjectName || "");
      setStatus(subject.status || "A");
      setDimensionId(currentDimensionId || "");
    }
  }, [subject, currentDimensionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectName) {
      Swal.fire({
        title: "Campo requerido",
        text: "El nombre de la materia es obligatorio",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3085d6",
        customClass: {
          container: "font-sans"
        }
      });
      return;
    }

    setIsSubmitting(true);
    
    // Si cambió la dimensión, primero confirmar con SweetAlert2
    if (dimensionChanged) {
      const result = await Swal.fire({
        title: "¿Cambiar dimensión?",
        html: `¿Estás seguro de cambiar la materia <strong>"${subjectName}"</strong> a otra dimensión?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        customClass: {
          container: "font-sans"
        }
      });
      
      if (result.isConfirmed) {
        await onChangeDimension(dimensionId);
      } else {
        setIsSubmitting(false);
        return;
      }
    }
    
    // Actualizar datos de la materia
    const subjectData = {
      id: subject.id,
      subjectName,
      status
    };

    onSave(subjectData);
  };

  const handleDimensionChange = (e) => {
    const newDimensionId = e.target.value;
    setDimensionId(newDimensionId);
    setDimensionChanged(newDimensionId !== currentDimensionId);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Editar materia</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la materia
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dimensión
            </label>
            <select
              value={dimensionId}
              onChange={handleDimensionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dimensions.map((dimension) => (
                <option key={dimension.id} value={dimension.id}>
                  {dimension.name}
                </option>
              ))}
            </select>
            {dimensionChanged && (
              <div className="flex items-center text-yellow-600 text-sm mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Cambiar la dimensión requerirá confirmación</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubjectModal;
