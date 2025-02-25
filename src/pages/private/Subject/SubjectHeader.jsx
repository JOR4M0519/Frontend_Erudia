import React from "react";
import { BookOpen, Users, Star, Edit3, Award, BarChart2 } from "lucide-react";

export default function SubjectHeader({
  isTeacher,
  subjectName,
  periodGrade,
  activities,
  groupInfo,
  onOpenScheme,
  onOpenLogro,
  customActionContent // Nuevo prop para contenido personalizado
}) {
  
  // Cálculo de promedio (solo para profesores)
  const calculateAverage = () => {
    if (!activities || !activities.length) return "N/A";
    
    const allScores = activities.reduce((acc, activity) => {
      if (activity.score && activity.score.length > 0) {
        const scores = activity.score.map((item) => item.score);
        return acc.concat(scores);
      }
      return acc;
    }, []);
    
    return allScores.length > 0
      ? (allScores.reduce((sum, cur) => sum + cur, 0) / allScores.length).toFixed(2)
      : "N/A";
  };

  // Determinar color basado en la calificación (para mejorar el feedback visual)
  const getScoreColor = (score) => {
    if (score === "N/A") return "text-gray-500";
    const numScore = parseFloat(score);
    if (numScore >= 4.0) return "text-green-500";
    if (numScore >= 3.0) return "text-yellow-500";
    return "text-red-500";
  };

  // Contenido de la calificación según el rol
  const average = isTeacher ? calculateAverage() : periodGrade ?? "N/A";
  const scoreText = isTeacher ? "Promedio:" : "Nota:";
  const scoreColor = getScoreColor(average);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 transition-all hover:shadow-xl border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Sección de información de la materia */}
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">
              {subjectName || "Materia"}
            </h2>
            
            {isTeacher && groupInfo && (
              <div className="flex items-center mt-2 bg-indigo-50 px-3 py-1 rounded-lg w-fit">
                <Users className="w-4 h-4 text-indigo-600 mr-2" />
                <span className="text-sm text-indigo-700 font-medium">
                  {groupInfo.groupName} {groupInfo.groupCode && `(${groupInfo.groupCode})`} {groupInfo.level?.levelName && `- ${groupInfo.level.levelName}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sección de calificación y acciones */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Si hay contenido personalizado, lo mostramos en lugar del contenido predeterminado */}
          {customActionContent ? (
            customActionContent
          ) : (
            <>
              {/* Tarjeta de calificación */}
              <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 w-full sm:w-auto flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-full">
                    <Star className={`w-5 h-5 ${scoreColor}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">{scoreText}</p>
                    <p className={`text-xl font-bold ${scoreColor}`}>{average}</p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {onOpenScheme && (
                  <button
                    onClick={onOpenScheme}
                    className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 font-medium rounded-lg px-4 py-2 hover:bg-blue-100 transition"
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>Esquema Evaluación</span>
                  </button>
                )}

                {onOpenLogro && (
                  <button
                    onClick={onOpenLogro}
                    className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-600 font-medium rounded-lg px-4 py-2 hover:bg-green-100 transition"
                  >
                    <Award className="w-4 h-4" />
                    <span>Logro</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}