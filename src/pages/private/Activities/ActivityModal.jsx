import { X, Calendar, Clock, CheckCircle, AlertCircle, BookOpen, MessageSquare } from "lucide-react";
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

  // Función para obtener el estado con formato visual
  const getStatusBadge = (status) => {
    if (!status) return "-";
    
    switch(status.toUpperCase()) {
      case "COMPLETED":
      case "A":
        return (
          <span className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Completada</span>
          </span>
        );
      case "IN_PROGRESS":
      case "P":
        return (
          <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            <span>En progreso</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Pendiente</span>
          </span>
        );
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md backdrop-brightness-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        
        {/* Header con información principal */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 flex justify-between items-center border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{taskData.name || "Sin título"}</h2>
            <p className="text-sm text-gray-600">{taskData.subject || "Sin materia"}</p>
          </div>
          <button
            onClick={() => subjectActivityService.closeTaskModal()}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Información general */}
        <div className="bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Estado */}
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="text-center md:text-left">
                <p className="text-xs text-gray-500 mb-1">Estado</p>
                {getStatusBadge(taskData.status)}
              </div>
            </div>
            
            {/* Nota */}
            <div className="flex items-center gap-2 justify-center">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Calificación</p>
                {Array.isArray(taskData.score) ? (
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                    {taskData.score.length} estudiantes
                  </span>
                ) : (
                  <span className={`font-medium text-lg ${
                    taskData.score >= 3 ? "text-green-600" : 
                    taskData.score === "-" ? "text-gray-600" : "text-red-600"
                  }`}>
                    {taskData.score ?? "-"}
                  </span>
                )}
              </div>
            </div>
            
            {/* Saber */}
            <div className="flex items-center gap-2 justify-center md:justify-end">
              <div className="text-center md:text-right">
                <p className="text-xs text-gray-500 mb-1">Saber</p>
                <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>{taskData.knowledge?.name || "General"}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Descripción */}
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              Descripción
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="whitespace-pre-wrap text-gray-700">
                {taskData.description || "Sin descripción disponible para esta actividad."}
              </p>
            </div>
          </div>

          {/* Fechas */}
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-500 rounded-full"></span>
              Fechas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-full">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha de inicio</p>
                  <p className="font-medium">{formatDate(taskData.startDate)}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                <div className="bg-amber-50 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha de entrega</p>
                  <p className="font-medium">{formatDate(taskData.endDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comentario (Opcional) */}
          {taskData.comment && taskData.comment !== "-" && (
            <div className="space-y-2">
              <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                Comentario
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex gap-3">
                <div className="bg-purple-50 p-2 rounded-full h-fit">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-gray-700">{taskData.comment}</p>
              </div>
            </div>
          )}

          {/* Lista de estudiantes (si es profesor) */}
          {Array.isArray(taskData.score) && taskData.score.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                Calificaciones de estudiantes
              </h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-3 bg-gray-100 p-3 text-sm font-medium text-gray-600">
                  <div>Estudiante</div>
                  <div className="text-center">Calificación</div>
                  <div className="text-right">Estado</div>
                </div>
                <div className="divide-y divide-gray-200">
                  {taskData.score.map((studentScore) => (
                    <div key={studentScore.studentId} className="grid grid-cols-3 p-3 items-center">
                      <div className="text-gray-700 font-medium">
                        {studentScore.firstName} {studentScore.lastName}
                      </div>
                      <div className="text-center">
                        <span className={`inline-block font-medium px-3 py-1 rounded-full ${
                          studentScore.score >= 3 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {studentScore.score}
                        </span>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(studentScore.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
