import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { request } from "../../../services/config/axios_helper";

export default function EvaluationSchemeModal({ isOpen, onClose, subjectId, groupId,periodId }) {
  const [schemeEvaluation, setSchemeEvaluation] = useState([]);

  useEffect(() => {
    if (!subjectId || !groupId || !isOpen) return; // 🔹 Evita la ejecución innecesaria

    const fetchSchemeEvaluation = async () => {
      try {
        const response = await request("GET", "academy", `/achievements-group/periods/${periodId}/subjects/${subjectId}/groups/${groupId}`);
        if (response.status === 200 && Array.isArray(response.data)) {
          setSchemeEvaluation(response.data.map(transformSchemeData));
          
        } else {
          setSchemeEvaluation([]); // 🔹 Si no hay datos, vaciar estado
        }
      } catch (error) {
        console.error("Error obteniendo esquema de evaluación:", error);
        setSchemeEvaluation([]);
      }
    };

    fetchSchemeEvaluation();
  }, [subjectId, groupId, isOpen]);

  const transformSchemeData = (data) => ({
    id: data.id,
    knowledge: {
      id: data.subjectKnowledgeDomain?.idKnowledge?.id || "N/A",
      name: data.subjectKnowledgeDomain?.idKnowledge?.name || "Desconocido",
      percentage: data.subjectKnowledgeDomain?.idKnowledge?.percentage || "0",
    },
    achievement: {
      id: data.id,
      description: data.achievement || "Sin descripción",
    },
  });

  return (
    <div className={`fixed inset-0 backdrop-blur-md backdrop-brightness-75 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-lg transform transition-transform duration-300 scale-95">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Esquema de Evaluación</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-gray-200 rounded-xl overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 p-4 font-semibold text-gray-800">
              <div className="col-span-3">Saber</div>
              <div className="col-span-3 text-center">%</div>
              <div className="col-span-6">Logro</div>
            </div>

            {/* Evaluation Rows */}
            <div className="divide-y divide-gray-300">
              {schemeEvaluation.length > 0 ? (
                schemeEvaluation.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 p-4 bg-gray-100">
                    <div className="col-span-3 font-medium">{item.knowledge.name}</div>
                    <div className="col-span-3 text-center">{item.knowledge.percentage}%</div>
                    <div className="col-span-6 text-gray-700">{item.achievement.description}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center p-4">No hay datos disponibles.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            Cerrar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2C] transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
