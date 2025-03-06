import React, { useState, useEffect } from "react";
import { User, GraduationCap, BookOpen, Users, Calendar, UserCheck, BarChart2, Percent } from "lucide-react";
import { studentDataService } from ".";

export default function StudentModal({ student, isOpen, onClose, onViewGrades }) {
  const [academicInfo, setAcademicInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student && student.id) {
      setLoading(true);
      studentDataService.getStudentAcademicProfile(student.id)
        .then(data => {
          if (data) {
            setAcademicInfo(data);
          }
        })
        .catch(err => console.error("Error cargando datos académicos:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  // Usamos los datos académicos obtenidos o los datos básicos del estudiante
  const studentData = academicInfo || student || {};

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Información del Estudiante
        </h2>
        
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500">Cargando información...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Información básica */}
            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
              <div className="bg-blue-100 rounded-full p-2">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Estudiante</p>
                <p className="font-medium text-lg">
                  {studentData.firstName} {studentData.lastName}
                </p>
                {studentData.email && (
                  <p className="text-sm text-gray-600">{studentData.email}</p>
                )}
              </div>
            </div>
            
            {/* Información académica - solo mostramos los campos disponibles */}
            <div className="grid grid-cols-2 gap-4">
              {studentData.course && (
                <div className="bg-gray-100 p-3 rounded-lg flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Curso</p>
                    <p className="font-medium">{studentData.course}</p>
                  </div>
                </div>
              )}
              
              {studentData.academicLevel && (
                <div className="bg-gray-100 p-3 rounded-lg flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Nivel Académico</p>
                    <p className="font-medium">{studentData.academicLevel}</p>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-100 p-3 rounded-lg flex items-start gap-2">
                <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Observaciones</p>
                  <p className="font-medium">{studentData.observationsCount || 0}</p>
                </div>
              </div>
              
              {/* Mentor/Director de grupo */}
              {studentData.mentor && (
                <div className="bg-gray-100 p-3 rounded-lg flex items-start gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Director de Grupo</p>
                    <p className="font-medium">{studentData.mentor.name}</p>
                    <p className="text-xs text-gray-500">{studentData.mentor.email}</p>
                  </div>
                </div>
              )}
              
              {/* PROMEDIO - Comentado hasta tener datos del backend */}
              
              {/* <div className="bg-gray-100 p-3 rounded-lg flex items-start gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Promedio General</p>
                  <p className="font-medium">
                    {studentData.average ? (
                      <span className={`font-bold ${parseFloat(studentData.average) >= 3.5 ? 'text-green-600' : 'text-red-600'}`}>
                        {studentData.average}
                      </span>
                    ) : "No disponible"}
                  </p>
                </div>
              </div> */}
             
              
              {/* ASISTENCIA - Comentado hasta tener datos del backend */}
              {/* <div className="bg-gray-100 p-3 rounded-lg flex items-start gap-2">
                <Percent className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Asistencia</p>
                  <p className="font-medium">
                    {studentData.attendance ? (
                      <span className={`font-bold ${parseFloat(studentData.attendance) >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                        {studentData.attendance}%
                      </span>
                    ) : "No disponible"}
                  </p>
                </div>
              </div> */}
             

              {/* Familiares - solo si hay datos */}
              {Array.isArray(studentData.family) && studentData.family.length > 0 && (
                <div className="bg-gray-100 p-3 rounded-lg col-span-2 flex items-start gap-2">
                  <Users className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm text-gray-500">Familiares</p>
                    <ul className="font-medium space-y-1">
                      {studentData.family.map((familiar, idx) => (
                        <li key={idx}>{familiar}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
          {onViewGrades && (
            <button
              onClick={onViewGrades}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Ver Calificaciones
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
