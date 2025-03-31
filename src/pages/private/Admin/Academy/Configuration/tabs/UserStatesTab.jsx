// UserStatesTab.jsx
import React, { useState, useEffect } from "react";
import { configurationService, UserStateForm } from "../";
import { Plus, Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

// Datos de ejemplo para visualización
const SAMPLE_STUDENT_STATES = [
  { id: 1, name: "Activo" },
  { id: 2, name: "Repitente" },
  { id: 3, name: "Retirado" },
  { id: 4, name: "Expulsado" },
  { id: 5, name: "Nuevo" }
];

const UserStatesTab = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentState, setCurrentState] = useState(null);

  // Flag para usar datos de ejemplo o API real
  const useSampleData = true; // Cambia a false cuando implementes el backend

  // Cargar estados al montar el componente
  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      setLoading(true);
      
      // Usar datos de ejemplo o llamar a la API real
      if (useSampleData) {
        // Simulamos un retardo para ver el efecto de carga
        setTimeout(() => {
          setStates(SAMPLE_STUDENT_STATES);
          setLoading(false);
        }, 500);
      } else {
        const data = await configurationService.getStudentStates();
        setStates(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error al cargar estados de estudiantes:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los estados de estudiantes'
      });
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentState(null);
    setShowForm(true);
  };

  const handleEditClick = (state) => {
    setCurrentState(state);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede revertir",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        if (useSampleData) {
          // Simulamos eliminación con los datos de ejemplo
          setStates(states.filter(state => state.id !== id));
          Swal.fire(
            'Eliminado',
            'El estado ha sido eliminado',
            'success'
          );
        } else {
          await configurationService.deleteStudentState(id);
          await fetchStates();
          Swal.fire(
            'Eliminado',
            'El estado ha sido eliminado',
            'success'
          );
        }
      }
    } catch (error) {
      console.error("Error al eliminar estado:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el estado'
      });
    }
  };

  const handleSaveState = async (stateData) => {
    try {
      if (useSampleData) {
        // Simulamos guardar con los datos de ejemplo
        if (currentState) {
          // Actualizar estado existente
          setStates(states.map(state => 
            state.id === currentState.id ? { ...state, name: stateData.name } : state
          ));
        } else {
          // Crear nuevo estado
          const newState = {
            id: Math.max(...states.map(s => s.id), 0) + 1,
            name: stateData.name
          };
          setStates([...states, newState]);
        }
        
        setShowForm(false);
        
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: currentState 
            ? 'Estado actualizado correctamente' 
            : 'Estado creado correctamente'
        });
      } else {
        if (currentState) {
          // Actualizar estado existente
          await configurationService.updateStudentState(currentState.id, stateData);
        } else {
          // Crear nuevo estado
          await configurationService.createStudentState(stateData);
        }
        
        await fetchStates();
        setShowForm(false);
        
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: currentState 
            ? 'Estado actualizado correctamente' 
            : 'Estado creado correctamente'
        });
      }
    } catch (error) {
      console.error("Error al guardar estado:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el estado'
      });
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Estado de los estudiantes</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {states.map((state) => (
              <li key={state.id} className="hover:bg-gray-50">
                <div className="flex justify-between items-center px-6 py-4">
                  <span className="text-gray-900">{state.name}</span>
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditClick(state)}
                      className="text-gray-600 hover:text-blue-700 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 mr-2 transition-colors"
                    >
                      <span className="flex items-center">
                        <Edit size={14} className="mr-1" />
                        Editar
                      </span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteClick(state.id)}
                      className="text-gray-600 hover:text-red-700 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 transition-colors"
                    >
                      <span className="flex items-center">
                        <Trash2 size={14} className="mr-1" />
                        Eliminar
                      </span>
                    </motion.button>
                  </div>
                </div>
              </li>
            ))}
            {states.length === 0 && (
              <li className="px-6 py-4 text-center text-sm text-gray-500">
                No hay estados registrados
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-4">
        {!showForm ? (
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddClick}
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-full inline-flex items-center transition-all duration-300 shadow-md"
          >
            <Plus size={18} className="mr-1" />
            Agregar estado
          </motion.button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UserStateForm
                state={currentState}
                onSave={handleSaveState}
                onCancel={handleCancelForm}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default UserStatesTab;
