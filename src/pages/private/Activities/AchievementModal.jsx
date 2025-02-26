import React, { useState, useEffect } from "react";
import { X, Save, Award,Loader2  } from "lucide-react";
import { CancelButton,ConfirmDialog,XButton } from "../../../components";
import { configViewService } from "../Setting";
import { teacherDataService } from "../Dashboard/StudentLayout";


export default function AchievementModal({ isOpen, onClose, activity, onSave }) {
    const [selectedKnowledge, setSelectedKnowledge] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [knowledge, setKnowledge] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    

    useEffect(() => {
        // 🔹 Suscripción al período seleccionado
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
                    const data = await teacherDataService.getKnowledgesBySubject(selectedPeriod, activity.subject.id);
                    setKnowledge(data.map((k) => k.knowledge)); // Mapeamos para extraer solo el objeto knowledge
    
                    if (activity.knowledge) {
                        setSelectedKnowledge(activity.knowledge);
                    } else {
                        setSelectedKnowledge(null);
                    }
                } catch (error) {
                    console.error("Error al obtener los conocimientos:", error);
                    setKnowledge([]);
                }
            };
    
            fetchKnowledges();
        }
    }, [isOpen, activity?.subject, selectedPeriod]);
    
    const handleSaberChange = (e) => {
        const knowledgeId = e.target.value;
        const selectedKnowledge = knowledge.find((s) => s.id === knowledgeId) || null;
        setSelectedKnowledge(selectedKnowledge);
    };
    console.log(knowledge)
    const handleClose = async () => {
      onClose();
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await onSave({
                activityId: activity.id,
                knowledge: selectedKnowledge,
            });
            setIsSaving(false);
        } catch (error) {
            console.error("Error al guardar:", error);
            setIsSaving(false);
            alert("Ocurrió un error al guardar. Por favor intente nuevamente.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-100">
                    <div className="flex items-center space-x-2">
                        <Award className="text-blue-600 w-5 h-5" />
                        <h2 className="text-lg font-semibold text-blue-800">
                            Logro de la Actividad
                        </h2>
                    </div>
                    <XButton onClick={handleClose} confirmExit />
                </div>

                <div className="p-5">
                    <div className="mb-5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h3 className="font-medium text-gray-800">{activity?.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity?.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {selectedKnowledge?.name || "Sin categoría"} ({selectedKnowledge?.percentage || 0}%)
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
                        <label htmlFor="saber" className="block text-sm font-medium text-gray-700">
                            Saber
                        </label>
                        <select
                            id="saber"
                            className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedKnowledge?.id || ""}
                            onChange={handleSaberChange}
                        >
                            <option value="">Seleccione un saber</option>
                            {knowledge.map((knowledge) => (
                                <option key={knowledge.id} value={knowledge.id}>
                                    {knowledge.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* <div className="mt-4">
                        <label htmlFor="achievement" className="block text-sm font-medium text-gray-700">
                            Logro de Aprendizaje
                        </label>
                        <div
                            id="achievement"
                            className="mt-1 bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-16 text-gray-700"
                        >
                            {achievement || "Seleccione un saber para ver el logro correspondiente."}
                        </div>
                    </div> */}
                </div>

                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-end space-x-2">
                    <CancelButton onClick={handleClose} confirmExit />
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !selectedKnowledge}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:opacity-70 disabled:cursor-not-allowed"
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
            </div>
        </div>
    );
}
