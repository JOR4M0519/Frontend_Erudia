import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { subjectActivityService } from "../Subject";

export default function ActivityModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [taskData, setTaskData] = useState(null);

  useEffect(() => {
    const subscription = subjectActivityService.getTaskModal().subscribe(({ isOpen, activityData }) => {
      setIsOpen(isOpen);
      setTaskData(activityData ?? {}); // 🔹 Usa un objeto vacío si activityData es undefined
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isOpen || !taskData) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md backdrop-brightness-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-lg">
        
        {/* 🔹 Header con columnas de información */}
        <div className="bg-gray-200 px-6 py-4 flex justify-between items-center border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-800">{taskData.name || "Sin título"}</h2>
          <button
            onClick={() => subjectActivityService.closeTaskModal()}
            className="p-2 hover:bg-gray-300 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🔹 Tabla de información */}
        <div className="bg-gray-100 p-4">
          <div className="grid grid-cols-4 text-center font-semibold text-gray-700 border-b border-gray-300 pb-2">
            <span>Tarea</span>
            <span>Estado</span>
            <span>Nota</span>
            <span>Saber</span>
          </div>
          <div className="grid grid-cols-4 text-center mt-2">
            <span className="font-medium text-gray-800">{taskData.name || "-"}</span>
            <span className="text-gray-600">{taskData.status || "-"}</span>

            {/* 🔹 Si es profesor, mostrar lista de notas de estudiantes */}
            {Array.isArray(taskData.score) ? (
              <div className="col-span-2 text-left space-y-2">
                {taskData.score.map((studentScore) => (
                  <div key={studentScore.studentId} className="flex justify-between items-center border-b py-1">
                    <span className="text-gray-700">
                      {studentScore.firstName} {studentScore.lastName}
                    </span>
                    <span className={`font-medium ${studentScore.score >= 3 ? "text-green-600" : "text-red-600"}`}>
                      {studentScore.score}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              // 🔹 Si es estudiante, mostrar solo su nota
              <span className={`font-medium ${taskData.score >= 3 ? "text-green-600" : "text-red-600"}`}>
                {taskData.score ?? "-"}
              </span>
            )}

            <span className="text-gray-600">{taskData.knowledge?.name || "-"}</span>
          </div>
        </div>

        {/* 🔹 Contenido Principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-gray-200 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Descripción</h3>
            <div className="bg-gray-100 p-4 rounded-lg max-h-48 overflow-y-auto">
              <p className="whitespace-pre-wrap text-gray-700">
                {taskData.description || "Sin descripción"}
              </p>
            </div>
          </div>

          {/* 🔹 Fechas */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-sm text-gray-600 mb-2">Fechas</h3>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-gray-600">Inicio</p>
                <p className="font-medium">
                  {taskData.startDate ? new Date(taskData.startDate).toLocaleDateString() : "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Entrega</p>
                <p className="font-medium">
                  {taskData.endDate ? new Date(taskData.endDate).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* 🔹 Comentario (Opcional) */}
          {taskData.comment && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-sm text-gray-600 mb-2">Comentario</h3>
              <p className="text-gray-700">{taskData.comment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
