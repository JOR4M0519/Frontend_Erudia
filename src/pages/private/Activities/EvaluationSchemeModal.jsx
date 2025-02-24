import { X, Edit, Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { request } from "../../../services/config/axios_helper";
import { configViewService } from "../Setting";
import { subjectActivityService } from "../Subject";
import { decodeRoles, hasAccess } from "../../../utilities";
import { Roles } from "../../../models";
//import { decodeRoles, hasAccess, Roles } from "../../../utils/roleUtils"; // Asumiendo que estos imports son correctos

export default function EvaluationSchemeModal({ isOpen, onClose, groupId }) {
  const [schemeEvaluation, setSchemeEvaluation] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Verificar si el usuario es profesor
  const userState = useSelector((store) => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];
  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);

  useEffect(() => {
    // Suscripción al periodo seleccionado
    const periodSubscription = configViewService.getSelectedPeriod().subscribe(period => {
      setSelectedPeriod(period);
    });
    
    // Suscripción a la materia seleccionada
    const subjectSubscription = subjectActivityService.getSelectedSubject().subscribe(subjectString => {
      if (subjectString) {
        try {
          const parsedSubject = JSON.parse(subjectString);
          setSelectedSubject(parsedSubject);
        } catch (error) {
          console.error("Error al parsear la materia:", error);
          setError("Error al procesar los datos de la materia");
        }
      }
    });
    
    // Limpiar suscripciones al desmontar el componente
    return () => {
      periodSubscription.unsubscribe();
      subjectSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Verificar que tengamos todos los datos necesarios para hacer la petición
    if (!isOpen || !groupId || !selectedPeriod || !selectedSubject?.id) {
      return;
    }
    
    fetchSchemeEvaluation();
  }, [groupId, isOpen, selectedPeriod, selectedSubject?.id]);
  
  const fetchSchemeEvaluation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await request(
        "GET", 
        "academy", 
        `/achievements-group/periods/${selectedPeriod}/subjects/${selectedSubject.id}/groups/${groupId}`
      );
      
      if (response.status === 200 && Array.isArray(response.data)) {
        const transformedData = response.data.map(transformSchemeData);
        setSchemeEvaluation(transformedData);
      } else {
        setSchemeEvaluation([]);
      }
    } catch (error) {
      console.error("Error obteniendo esquema de evaluación:", error);
      setError("No se pudo cargar el esquema de evaluación");
      setSchemeEvaluation([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const transformSchemeData = (data) => ({
    id: data.id,
    knowledge: {
      id: data.subjectKnowledge?.idKnowledge?.id || "N/A",
      name: data.subjectKnowledge?.idKnowledge?.name || "Desconocido",
      percentage: data.subjectKnowledge?.idKnowledge?.percentage || "0",
    },
    achievement: {
      id: data.id,
      description: data.achievement || "Sin descripción",
    },
  });
  
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditValue(item.achievement.description);
  };
  
  const handleSaveClick = async (item) => {
    if (!editValue.trim()) return;
    
    setIsSaving(true);
    try {
      // Simular actualización - reemplazar por el endpoint correcto
      const response = await request(
        "PUT",
        "academy",
        `/achievements-group/${item.id}`,
        { achievement: editValue }
      );
      
      if (response.status === 200) {
        // Actualizar el estado local
        setSchemeEvaluation(prev => 
          prev.map(scheme => 
            scheme.id === item.id 
              ? {...scheme, achievement: {...scheme.achievement, description: editValue}} 
              : scheme
          )
        );
        setEditingId(null);
      }
    } catch (error) {
      console.error("Error al actualizar el logro:", error);
      setError("No se pudo actualizar el logro");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Esquema de Evaluación</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              <p>{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Saber</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b w-16">%</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Logro</th>
                    {isTeacher && (
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b w-20">Acción</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {schemeEvaluation.length > 0 ? (
                    schemeEvaluation.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border-b">{item.knowledge.name}</td>
                        <td className="py-3 px-4 border-b text-center">{item.knowledge.percentage}%</td>
                        <td className="py-3 px-4 border-b">
                          {editingId === item.id ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                            />
                          ) : (
                            item.achievement.description
                          )}
                        </td>
                        {isTeacher && (
                          <td className="py-3 px-4 border-b">
                            {editingId === item.id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSaveClick(item)}
                                  disabled={isSaving}
                                  className="p-1 rounded text-green-600 hover:bg-green-50"
                                  title="Guardar"
                                >
                                  {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 rounded text-red-600 hover:bg-red-50"
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEditClick(item)}
                                className="p-1 rounded text-blue-600 hover:bg-blue-50"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isTeacher ? 4 : 3} className="py-8 px-4 text-center text-gray-500">
                        No hay datos disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cerrar
          </button>
          {isTeacher && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}