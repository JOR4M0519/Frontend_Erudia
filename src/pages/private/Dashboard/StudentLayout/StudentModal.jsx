import React, { useState, useEffect } from "react";
import { User, GraduationCap, BookOpen, Users, Calendar, UserCheck, BarChart2, Percent } from "lucide-react";
import { studentDataService } from ".";
import { configViewService } from "../../Setting";

export default function StudentModal({ student, isOpen, onClose, onViewGrades }) {
  const [academicInfo, setAcademicInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState(null);

  
  useEffect(() => {
    const selectedPeriodSubscription = configViewService
      .getSelectedPeriod()
      .subscribe((period) => {
        if (period) {
          setSelectedPeriod(period);
        }
      });
    return () => selectedPeriodSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen && student && student.id && selectedPeriod) {
      setLoading(true);
      studentDataService.getStudentAcademicProfile(student.id, selectedPeriod)
        .then(data => {
          if (data) {
            setAcademicInfo(data);
          }
        })
        .catch(err => console.error("Error cargando datos académicos:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, student, selectedPeriod]);

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



              {/* Familiares - Estilo similar a Profile.jsx con correo electrónico */}
              {Array.isArray(studentData.family) && studentData.family.length > 0 && (
                <div className="mt-6 col-span-2">
                  <h3 className="text-lg font-semibold flex items-center mb-4 text-gray-800">
                    <Users className="w-5 h-5 mr-2 text-gray-600" />
                    Familiares
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studentData.family.map((familiar) => {
                      return (
                        <div key={familiar.id} className="bg-gray-50 border border-gray-100 p-4 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200 relative group">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                              <User size={20} className="text-blue-600" />
                            </div>
                            <div className="w-full text-center">
                              <h4 className="font-medium text-blue-700 mb-1">{familiar.relationship}</h4>
                              <p className="font-medium mb-1">{familiar.name || "No registrado"}</p>

                            </div>
                          </div>

                          {/* Tooltip mejorado para correos largos */}
                          {familiar.email && (
                            <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-center whitespace-nowrap">
                                <p className="font-medium mb-1">{familiar.name}</p>
                                <p className="text-gray-600">{familiar.email}</p>
                              </div>
                              <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
