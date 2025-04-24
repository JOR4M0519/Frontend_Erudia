import React, { useState, useEffect } from "react";
import { X, Save, Award, Loader2, BookOpen, Search } from "lucide-react";
import { XButton } from "../../../components";
import { configViewService } from "../Setting";
import { activityService } from "./activityService";
import Swal from "sweetalert2";
import { PrivateRoutes } from "../../../models";
import { useNavigate } from "react-router-dom";

export default function AchievementModal({ isOpen, onClose, activity = {}, onSave }) {
    const navigate = useNavigate();
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [achievements, setAchievements] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [achievementsByKnowledge, setAchievementsByKnowledge] = useState({});
    const [activeTab, setActiveTab] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Colores para las pestañas - usamos un array para asignar dinámicamente
    const tabColors = ["blue", "green", "amber", "purple", "rose", "cyan", "indigo", "teal", "orange", "lime"];
    
    // Suscripción al período seleccionado
    useEffect(() => {
        const periodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
        return () => {
            periodSubscription.unsubscribe();
        };
    }, []);
        
    useEffect(() => {
        if (isOpen) {
            const fetchAchievements = async () => {
                // Verificar que existan los datos necesarios
                if (!activity?.subject?.id || !selectedPeriod) return;
    
                try { 
                    const response = await activityService.getEvaluationScheme(selectedPeriod, activity.subject.subjectId, activity.groupId);
                    
                    // Verificar si la respuesta tiene la estructura esperada
                    if (response.success && Array.isArray(response.data)) {
                        setAchievements(response.data);
                        
                        // Organizar los logros por tipo de conocimiento
                        const byKnowledge = response.data.reduce((acc, item) => {
                            const knowledgeId = item.knowledge.id;
                            if (!acc[knowledgeId]) {
                                acc[knowledgeId] = {
                                    knowledge: item.knowledge,
                                    achievements: []
                                };
                            }
                            acc[knowledgeId].achievements.push(item);
                            return acc;
                        }, {});
                        
                        setAchievementsByKnowledge(byKnowledge);
                        
                        // Establecer la primera pestaña como activa por defecto
                        if (Object.keys(byKnowledge).length > 0 && !activeTab) {
                            setActiveTab(Object.keys(byKnowledge)[0]);
                        }
                        
                        // Si hay un logro activo en la actividad, lo seleccionamos
                        if (activity.achievementGroupId) {
                            const currentAchievement = response.data.find(a => a.id === activity.achievementGroupId);
                            if (currentAchievement) {
                                setSelectedAchievement(currentAchievement);
                                // Activar la pestaña correspondiente al logro seleccionado
                                setActiveTab(String(currentAchievement.knowledge.id));
                            }
                        } else {
                            setSelectedAchievement(null);
                        }
                    } else {
                        throw new Error("Formato de respuesta inesperado");
                    }
                } catch (error) {
                    console.error("Error al obtener los logros:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudieron cargar los logros',
                        confirmButtonColor: '#3b82f6',
                        showClass: {
                            popup: 'animate__animated animate__fadeInDown'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOutUp'
                        }
                    });
                    setAchievements([]);
                    setAchievementsByKnowledge({});
                }
            };
    
            fetchAchievements();
        }
    }, [isOpen, activity?.subject, activity?.groupId, selectedPeriod]);
    
    const handleAchievementChange = (achievement) => {
        setSelectedAchievement(achievement);
    };

    const handleClose = async (isCancelled = true) => {
        if (isSaving) return;
        onClose(isCancelled);
    };
    
    const handleSave = async (e) => {
        if (e) e.preventDefault();
        
        if (!selectedAchievement) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Por favor seleccione un logro para continuar',
                confirmButtonColor: '#3b82f6',
                showClass: {
                    popup: 'animate__animated animate__fadeIn'
                }
            });
            return;
        }
    
        try {
            setIsSaving(true);
            
            if (!selectedAchievement?.id) {
                throw new Error("No se encontró el ID del logro seleccionado");
            }
            
            const data = {
                achievementGroupId: selectedAchievement.id,
                id: activity.id,
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
                handleClose(false);
                navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT)
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
    
    // Filtrar logros por término de búsqueda
    const filteredAchievements = activeTab && achievementsByKnowledge[activeTab] ? 
        achievementsByKnowledge[activeTab].achievements.filter(item => 
            item.achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
        ) : [];
    
    // Obtener color para la pestaña basado en su índice
    const getTabColor = (index) => {
        return tabColors[index % tabColors.length];
    };

    if (!isOpen) return null;

    // Asegurémonos de que activity sea un objeto válido
    const safeActivity = activity || {};
    
    return (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-30 z-50 flex items-center justify-center p-4 animate__animated animate__fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate__animated animate__zoomIn">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 flex items-center justify-between border-b border-blue-100">
                    <div className="flex items-center space-x-2">
                        <Award className="text-blue-600 w-5 h-5" />
                        <h2 className="text-lg font-semibold text-blue-800">
                            Asignación de Logro
                        </h2>
                    </div>
                    <XButton onClick={() => handleClose(true)} confirmExit={!isSaving} />
                </div>

                <form onSubmit={handleSave} className="p-5">
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="font-medium text-gray-800">{safeActivity.name || "Sin nombre"}</h3>
                        <p className="text-sm text-gray-600 mt-1">{safeActivity.description || "Sin descripción"}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {safeActivity?.subject?.subjectName || "Sin materia"}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {safeActivity.startDate ? new Date(safeActivity.startDate).toLocaleDateString() : "Sin fecha"} - 
                                {safeActivity.endDate ? new Date(safeActivity.endDate).toLocaleDateString() : "Sin fecha"}
                            </span>
                        </div>
                    </div>

                    {Object.keys(achievementsByKnowledge).length > 0 ? (
                        <>
                            {/* Pestañas de navegación - Ahora con colores dinámicos */}
                            <div className="flex overflow-x-auto space-x-1 mb-3 pb-1 border-b border-gray-200">
                                {Object.entries(achievementsByKnowledge).map(([knowledgeId, group], index) => {
                                    const isActive = activeTab === knowledgeId;
                                    const colorClass = getTabColor(index);
                                    
                                    return (
                                        <button
                                            key={`tab-${knowledgeId}`}
                                            type="button"
                                            onClick={() => setActiveTab(knowledgeId)}
                                            className={`px-3 py-2 text-sm font-medium rounded-t-lg flex items-center whitespace-nowrap
                                                ${isActive 
                                                    ? `bg-${colorClass}-100 text-${colorClass}-800 border-b-2 border-${colorClass}-500` 
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full mr-2 bg-${colorClass}-500`}></span>
                                            {group.knowledge.name}
                                            <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 rounded-full">
                                                {group.knowledge.percentage}%
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            
                            {/* Barra de búsqueda */}
                            <div className="mb-3 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar logro..."
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            {/* Lista de logros para la pestaña activa */}
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                                {filteredAchievements.length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                        {filteredAchievements.map((item) => {
                                            const isSelected = selectedAchievement?.id === item.id;
                                            return (
                                                <div 
                                                    key={`achievement-${item.id}`}
                                                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors
                                                        ${isSelected ? 'bg-blue-50' : ''}`}
                                                    onClick={() => handleAchievementChange(item)}
                                                >
                                                    <div className="flex items-start">
                                                        <input
                                                            type="radio"
                                                            id={`achievement-${item.id}`}
                                                            name="achievement"
                                                            checked={isSelected}
                                                            onChange={() => handleAchievementChange(item)}
                                                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                            disabled={isSaving}
                                                        />
                                                        <label 
                                                            htmlFor={`achievement-${item.id}`}
                                                            className="ml-2 text-sm text-gray-700 cursor-pointer"
                                                        >
                                                            {item.achievement.description}
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        {searchTerm 
                                            ? "No se encontraron logros que coincidan con la búsqueda" 
                                            : "No hay logros disponibles para este saber"
                                        }
                                    </div>
                                )}
                            </div>
                            
                            {/* Resumen del logro seleccionado */}
                            {selectedAchievement && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-1">Logro seleccionado:</h4>
                                    <p className="text-sm text-blue-700">{selectedAchievement.achievement.description}</p>
                                    <div className="mt-2 flex items-center">
                                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                            {selectedAchievement.knowledge.name} ({selectedAchievement.knowledge.percentage}%)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-amber-600">
                                No hay logros disponibles para esta materia en el período actual.
                            </p>
                        </div>
                    )}
                
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-end space-x-2 mt-6 -mx-5 -mb-5">
                        <button
                            type="button"
                            onClick={() => handleClose(true)}
                            disabled={isSaving}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !selectedAchievement}
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
