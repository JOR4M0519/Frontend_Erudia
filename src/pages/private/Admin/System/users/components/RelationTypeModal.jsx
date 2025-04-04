import React, { useState } from "react";
import { X, Plus, Edit, Save, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const RelationTypeModal = ({ 
  showModal, 
  closeModal, 
  relationshipTypes, 
  createRelationshipType,
  updateRelationshipType,
  deleteRelationshipType
}) => {
  const [newRelationshipType, setNewRelationshipType] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.stopPropagation();
    
    if (!newRelationshipType.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Ingrese un nombre para el tipo de relación',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {
      if (editMode && editingType) {
        await updateRelationshipType(editingType.id, { relationshipType: newRelationshipType });
        resetForm();
      } else {
        await createRelationshipType({ relationshipType: newRelationshipType });
        resetForm();
      }
    } catch (error) {
      console.error("Error al procesar tipo de relación:", error);
    }
  };

  const startEdit = (type) => {
    setEditMode(true);
    setEditingType(type);
    setNewRelationshipType(type.relationshipType);
  };
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Está seguro?',
        text: "Esta acción eliminará el tipo de relación",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
      
      if (result.isConfirmed) {
        const success = await deleteRelationshipType(id);
        
        // No mostramos otro Swal aquí porque deleteRelationshipType ya muestra su propio mensaje
        if (success) {
          // Podemos actualizar el estado local o cerrar el modal si es necesario
        }
      }
    } catch (error) {
      console.error("Error al eliminar tipo de relación:", error);
      // No necesitamos mostrar Swal aquí porque deleteRelationshipType ya maneja los errores
    }
  };

  const resetForm = () => {
    setNewRelationshipType("");
    setEditMode(false);
    setEditingType(null);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Capa de fondo oscuro con onClick para cerrar */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Contenedor del modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                {editMode ? <Edit className="h-6 w-6 text-blue-600" /> : <Plus className="h-6 w-6 text-green-600" />}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {editMode ? "Editar Tipo de Relación" : "Nuevo Tipo de Relación"}
                </h3>
                <div className="mt-4">
                  <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700">
                    Nombre del tipo de relación
                  </label>
                  <input
                    type="text"
                    id="relationshipType"
                    name="relationshipType"
                    value={newRelationshipType}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      setNewRelationshipType(e.target.value);
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ej: Padre, Madre, Hermano, Tío..."
                  />
                </div>
                
                {/* Lista de tipos de relación existentes */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tipos de relación existentes</h4>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                    {relationshipTypes.length === 0 ? (
                      <p className="text-sm text-gray-500 p-3 text-center">No hay tipos de relación definidos</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {relationshipTypes.map((type) => (
                          <li key={type.id} className="px-3 py-2 flex justify-between items-center hover:bg-gray-50">
                            <span className="text-sm text-gray-800">{type.relationshipType}</span>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => startEdit(type)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(type.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Save className="h-5 w-5 mr-2" />
              {editMode ? "Actualizar" : "Crear"}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => resetForm()}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar edición
              </button>
            )}
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                resetForm();
                closeModal();
              }}
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RelationTypeModal;
