import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ActivitiesList({ tasks, handleTaskClick, isTeacher }) {
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Alternar visibilidad de estudiantes
  const toggleExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden">
      <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-gray-600 border-b border-gray-200">
        <div className="col-span-4">Tarea</div>
        <div className="col-span-4">Descripción</div>
        <div className="col-span-2 text-center">Entrega</div>
        <div className="col-span-2 text-center">Notas</div>
      </div>

      <div className="divide-y divide-gray-200">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="bg-white">
              {/* 🔹 Fila Principal */}
              <div
                onClick={() => handleTaskClick(task)}
                className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-200 transition-colors items-center cursor-pointer"
              >
                <div className="col-span-4 font-medium text-gray-700">{task.name}</div>
                <div className="col-span-4 text-gray-600">{task.description}</div>
                <div className="col-span-2 text-center text-gray-600">
                  {task.startDate && new Date(task.startDate + 'T00:00:00').toLocaleDateString()} -{" "}
                  {task.endDate && new Date(task.endDate + 'T00:00:00').toLocaleDateString()}
                </div>
                <div className="col-span-2 flex justify-center">
                  {/* Columna del profesor */}
                  {isTeacher ? (
                    <ButtonTeacherSchollStudentList
                      task={task}
                      expandedTaskId={expandedTaskId}
                      toggleExpand={toggleExpand}
                    />
                  ) :
                    (
                      <span className="text-gray-700">
                        {task.score === "-" ? "Sin calificar" : task.score}
                      </span>
                    )}
                  {/* Columna del estudiante de las notas */}
                </div>
              </div>

              {/* 🔹 Sección de estudiantes (Solo si el profesor expande) */}
              {isTeacher && expandedTaskId === task.id && (
                <div className="bg-gray-50 p-4 border-t border-gray-300">
                  <h3 className="text-sm font-semibold text-gray-700">Calificaciones</h3>
                  <div className="mt-2 space-y-1">
                    {task.score && task.score.length > 0 ? (
                      task.score
                        .filter(student => student.score !== "-") // Filtrar estudiantes sin calificación
                        .map((student) => (
                          <div key={student.studentId} className="flex justify-between p-2 bg-white rounded-lg">
                            <span className="text-gray-700">
                              {student.firstName} {student.lastName}
                            </span>
                            <span className={`font-medium ${student.score >= 3 ? "text-green-600" : "text-red-600"}`}>
                              {student.score}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500">Sin calificaciones aún.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center p-4">No hay tareas disponibles.</p>
        )}
      </div>
    </div>
  );
}

export const ButtonTeacherSchollStudentList = ({ task, expandedTaskId, toggleExpand }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleExpand(task.id);
      }}
      className="text-gray-600 hover:text-black flex items-center gap-1"
    >
      {expandedTaskId === task.id ? "Ocultar" : "Ver Notas"}
      {expandedTaskId === task.id ? <ChevronUp /> : <ChevronDown />}
    </button>
  );
};