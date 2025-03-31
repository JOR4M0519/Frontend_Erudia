import React, { useState, useEffect } from "react";
import { X, Save, Award, Loader2 } from "lucide-react";
import { CancelButton, ConfirmDialog, XButton } from "../../../components";
import { configViewService } from "../Setting";
import { teacherDataService } from "../Dashboard/StudentLayout";
import { activityService } from "./activityService";
import Swal from "sweetalert2";

export default function AchievementModal({ isOpen, onClose, activity, onSave }) {
    const [selectedKnowledge, setSelectedKnowledge] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [knowledges, setKnowledges] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    
    //  Suscripción al período seleccionado (usando useEffect
    useEffect(() => {
        const periodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
        return () => {
            periodSubscription.unsubscribe();
        };
    }, []);
        
    useEffect(() => {
        if (isOpen) {
            const fetchKnowledges = async () => {
                if (!activity?.subject?.id || !selectedPeriod) return;
    
                try { 
                    const data = await activityService.getKnowledgesBySubject(selectedPeriod, activity.subject.id);
                    
                    // Asegurémonos de que no hay duplicados
                    const uniqueKnowledges = data.reduce((acc, item) => {
                        if (!acc.some(k => k.knowledge.id === item.knowledge.id)) {
                            acc.push(item);
                        }
                        return acc;
                    }, []);
                    
                    setKnowledges(uniqueKnowledges);
                    
                    // Si hay un conocimiento activo en la actividad, lo seleccionamos
                    if (activity.knowledge) {
                        const currentKnowledge = {
                            achievementGroupId: activity.achievementGroupId,
                            subjectKnowledgeId: activity.subjectKnowledgeId,
                            knowledge: activity.knowledge
                        };
                        
                        setSelectedKnowledge(currentKnowledge);
                    } else {
                        setSelectedKnowledge(null);
                    }
                } catch (error) {
                    console.error("Error al obtener los conocimientos:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudieron cargar los saberes',
                        confirmButtonColor: '#3b82f6',
                        showClass: {
                            popup: 'animate__animated animate__fadeInDown'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOutUp'
                        }
                    });
                    setKnowledges([]);
                }
            };
    
            fetchKnowledges();
        }
    }, [isOpen, activity?.subject, selectedPeriod]);
    
    const handleKnowledgeChange = (e) => {
        const subjectKnowledgeId = parseInt(e.target.value);
        const selected = knowledges.find(k => k.subjectKnowledgeId === subjectKnowledgeId);
        setSelectedKnowledge(selected);
    };

    const handleClose = async () => {
        if (isSaving) return;
        onClose();
    };
    
    const handleSave = async (e) => {
        if (e) e.preventDefault();
        
        if (!selectedKnowledge) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Por favor seleccione un saber para continuar',
                confirmButtonColor: '#3b82f6',
                showClass: {
                    popup: 'animate__animated animate__fadeIn'
                }
            });
            return;
        }
    
        try {
            setIsSaving(true);
            
            // Verificar que tengamos los IDs necesarios
            if (!activity?.achievementGroupId) {
                throw new Error("No se encontró el ID del logro de grupo");
            }
    
            if (!selectedKnowledge?.subjectKnowledgeId) {
                throw new Error("No se encontró el ID del conocimiento seleccionado");
            }
            
            const data = {
                achievementGroupId: activity.achievementGroupId,
                achievement: activity.achievement,
                subjectKnowledgeId: selectedKnowledge.subjectKnowledgeId,
                groupId: activity.groupId,
                periodId: selectedPeriod
            };
    
            const success = await onSave(data);
            
            if (success) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'El logro ha sido asignado correctamente',
                    confirmButtonColor: '#3b82f6',
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    showClass: {
                        popup: 'animate__animated animate__fadeIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut'
                    }
                });
                onClose();
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || "Ocurrió un error al guardar. Por favor intente nuevamente.",
                confirmButtonColor: '#3b82f6',
                showClass: {
                    popup: 'animate__animated animate__shakeX'
                }
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-md  bg-opacity-50 z-50 flex items-center justify-center p-4 animate__animated animate__fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate__animated animate__zoomIn">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 flex items-center justify-between border-b border-blue-100">
                    <div className="flex items-center space-x-2">
                        <Award className="text-blue-600 w-5 h-5" />
                        <h2 className="text-lg font-semibold text-blue-800">
                            Logro de la Actividad
                        </h2>
                    </div>
                    <XButton onClick={handleClose} confirmExit={!isSaving} />
                </div>

                <form onSubmit={handleSave} className="p-5">
                    <div className="mb-5 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="font-medium text-gray-800">{activity?.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity?.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {selectedKnowledge?.knowledge?.name || "Sin categoría"} ({selectedKnowledge?.knowledge?.percentage || 0}%)
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {activity?.subject?.name || "Sin materia"}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {new Date(activity?.startDate || "").toLocaleDateString()} - {new Date(activity?.endDate || "").toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="knowledge" className="block text-sm font-medium text-gray-700">
                            Saber <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="knowledge"
                            className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            value={selectedKnowledge?.subjectKnowledgeId || ""}
                            onChange={handleKnowledgeChange}
                            required
                            disabled={isSaving}
                        >                 
                            <option value="">Seleccione un saber</option>
                            {knowledges.map((item, index) => (
                                <option 
                                    key={`knowledge-${item.subjectKnowledgeId}-${index}`} 
                                    value={item.subjectKnowledgeId}
                                >
                                    {item.knowledge.name} ({item.knowledge.percentage}%)
                                </option>
                            ))}
                        </select>
                        {knowledges.length === 0 && (
                            <p className="text-sm text-amber-600 mt-1">
                                No hay saberes disponibles para esta materia.
                            </p>
                        )}
                    </div>
                
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-end space-x-2 mt-6 -mx-5 -mb-5">
                        <CancelButton onClick={handleClose} confirmExit={!isSaving} disabled={isSaving} />
                        <button
                            type="submit"
                            disabled={isSaving || !selectedKnowledge}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Guardar</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
