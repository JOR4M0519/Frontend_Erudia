import React from "react";
import { X, Pencil } from "lucide-react";

export default function ObservationModal({ isOpen, observationData, onClose }) {
  if (!isOpen ) return null;
  //if (!isOpen || !observation) return null;
  
  const testObservation = {
    title: "Falta de Atención en Clase",
    date: "2024-02-27",
    teacher: {
      firstName: "María",
      lastName: "Gómez",
    },
    situation:
      "El estudiante ha mostrado dificultades para mantener la atención en clase, a pesar de múltiples llamados de atención por parte del docente.",
    commitment:
      "El estudiante se compromete a participar activamente en clase y reducir distracciones, además de llevar un registro de tareas completadas.",
    followUp:
      "Se realizará un seguimiento semanal durante el próximo mes para evaluar mejoras en la concentración y participación.",
  };
  const observation = observationData || testObservation;

  const handleSave = () => {
    // Implementar lógica de guardado
    console.log("Guardando observación...");
    onClose();
  };

  const handleExport = () => {
    // Implementar lógica de exportación
    console.log("Exportando observador...");
  };

  const handleEditSection = (section) => {
    // Aquí se puede implementar la lógica para editar cada sección (situación, compromiso, seguimiento)
    console.log(`Editando sección: ${section}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="grid grid-cols-3 gap-4 flex-1">
            <div>
              <h3 className="font-medium text-gray-900">Título</h3>
              <p className="text-gray-600">{observation.title}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Fecha</h3>
              <p className="text-gray-600">{observation.date}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Profesor</h3>
              <p className="text-gray-600">
                {observation.teacher.firstName + " " + observation.teacher.lastName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Situation */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium">Situación</h3>
              <button onClick={() => handleEditSection("situación")}>
                <Pencil className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{observation.situation}</p>
          </div>

          {/* Student Commitment */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium">Compromiso del estudiante</h3>
              <button onClick={() => handleEditSection("compromiso")}>
                <Pencil className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{observation.commitment}</p>
          </div>

          {/* Follow-up */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium">Seguimiento</h3>
              <button onClick={() => handleEditSection("seguimiento")}>
                <Pencil className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{observation.followUp}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
          <button
            onClick={handleExport}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
          >
            Exportar observador
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-white bg-[#D4AF37] rounded-full hover:bg-[#C19B2C] transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
