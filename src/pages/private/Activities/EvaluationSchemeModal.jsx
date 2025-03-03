import { X, Edit, Save, Loader2, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { request } from "../../../services/config/axios_helper";
import { configViewService } from "../Setting";
import { subjectActivityService } from "../Subject";
import { decodeRoles, hasAccess } from "../../../utilities";
import { Roles } from "../../../models";

export default function EvaluationSchemeModal({ isOpen, onClose, groupId }) {
  const [schemeEvaluation, setSchemeEvaluation] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [actualGroupId, setActualGroupId] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const userState = useSelector((store) => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];
  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);

  useEffect(() => {
    const periodSubscription = configViewService.getSelectedPeriod().subscribe(period => {
      setSelectedPeriod(period);
    });
    
    const subjectSubscription = subjectActivityService.getSelectedSubject().subscribe(subjectString => {
      if (subjectString) {
        try {
          const parsedSubject = JSON.parse(subjectString);
          setSelectedSubject(parsedSubject);
          if (!groupId && parsedSubject?.group?.id) {
            setActualGroupId(parsedSubject.group.id);
          }
        } catch (error) {
          console.error("Error al parsear la materia:", error);
          setError("Error al procesar los datos de la materia");
        }
      }
    });
    
    if (groupId) {
      setActualGroupId(groupId);
    }
    
    return () => {
      periodSubscription.unsubscribe();
      subjectSubscription.unsubscribe();
    };
  }, [groupId]);

  useEffect(() => {
    if (!isOpen || !actualGroupId || !selectedPeriod || !selectedSubject?.id) {
      return;
    }
    
    fetchSchemeEvaluation();
  }, [actualGroupId, isOpen, selectedPeriod, selectedSubject?.id]);
  
  const fetchSchemeEvaluation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching scheme with:", {
        period: selectedPeriod,
        subjectId: selectedSubject.id,
        groupId: actualGroupId
      });

      const response = await request(
        "GET", 
        "academy", 
        `/achievements-group/periods/${selectedPeriod}/subjects/${selectedSubject.id}/groups/${actualGroupId}`
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
      const response = await request(
        "PUT",
        "academy",
        `/achievements-group/${item.id}`,
        { achievement: editValue }
      );
      
      if (response.status === 200) {
        setSchemeEvaluation(prev => 
          prev.map(scheme => 
            scheme.id === item.id 
              ? {...scheme, achievement: {...scheme.achievement, description: editValue}} 
              : scheme
          )
        );
        setEditingId(null);
        // Mostrar mensaje de éxito
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
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

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleCloseModal}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col transition-all duration-300 transform ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg transition-all duration-300 hover:bg-blue-200 hover:rotate-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Esquema de Evaluación</h2>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 rounded-full hover:bg-white/80 transition-colors duration-200 hover:rotate-90 transform"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Success message toast */}
        {showSuccessMessage && (
          <div className="absolute top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg transition-all duration-500 transform animate-slideInRight">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>¡Logro actualizado correctamente!</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <p className="text-gray-500 mt-4 animate-pulse">Cargando esquema de evaluación...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-5 rounded-lg border border-red-100 shadow-sm animate-fadeIn">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error al cargar</h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                  <button 
                    onClick={fetchSchemeEvaluation}
                    className="mt-3 px-4 py-2 bg-white border border-red-300 rounded-md text-red-600 text-sm hover:bg-red-50 transition-colors duration-200 flex items-center gap-2 hover:shadow-md"
                  >
                    <Loader2 className="w-4 h-4" /> Reintentar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Saber</th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-gray-700 border-b w-20">%</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Logro</th>
                    {isTeacher && (
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-700 border-b w-24">Acción</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {schemeEvaluation.length > 0 ? (
                    schemeEvaluation.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-blue-50 transition-colors duration-200 animate-fadeIn`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="py-3 px-4 text-gray-700 font-medium">{item.knowledge.name}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium text-sm hover:scale-110 transition-transform duration-200">
                            {item.knowledge.percentage}%
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-gray-600 ${editingId === item.id ? 'bg-blue-50' : ''}`}>
                          {editingId === item.id ? (
                            <div className="animate-fadeIn">
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 resize-none transition-all duration-200 shadow-sm"
                                rows={3}
                                placeholder="Ingrese el logro..."
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="block py-1 relative overflow-hidden hover:bg-blue-50 rounded-lg p-2 transition-colors duration-200">
                              {item.achievement.description}
                            </div>
                          )}
                        </td>
                        {isTeacher && (
                          <td className="py-3 px-4">
                            <div className="flex justify-center">
                              {editingId === item.id ? (
                                <div className="flex space-x-2 animate-fadeIn">
                                  <button
                                    onClick={() => handleSaveClick(item)}
                                    disabled={isSaving}
                                    className="p-2 rounded-lg text-green-600 hover:bg-green-100 transition-all duration-200 flex items-center gap-1 hover:shadow-md"
                                    title="Guardar"
                                  >
                                    {isSaving ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-xs">Guardando...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-4 h-4" />
                                        <span className="text-xs">Guardar</span>
                                      </>
                                    )}
</button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200 flex items-center gap-1 hover:shadow-md"
                                    title="Cancelar"
                                  >
                                    <X className="w-4 h-4" />
                                    <span className="text-xs">Cancelar</span>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleEditClick(item)}
                                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-all duration-200 group flex items-center gap-1 hover:shadow-md"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">Editar</span>
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td 
                        colSpan={isTeacher ? 4 : 3} 
                        className="py-12 text-center text-gray-500 bg-gray-50"
                      >
                        <div className="flex flex-col items-center justify-center space-y-3 animate-fadeIn">
                          <BookOpen className="w-12 h-12 text-gray-300 animate-bounce" />
                          <p>No hay datos disponibles en este momento.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-xl">
          <button
            onClick={handleCloseModal}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 hover:shadow-md"
          >
            Cerrar
          </button>
          {isTeacher && (
            <button
              onClick={handleCloseModal}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md group"
            >
              <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">Aceptar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}