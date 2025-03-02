import React from "react";
import { User, GraduationCap } from "lucide-react";

export default function StudentModal({ student, isOpen, onClose, onViewGrades }) {
  if (!isOpen) return null;

  /* Modal estudiante Observador */
  // Grupo - Nivel académico
  // Familiares estudiante
  // # de observaciones de un año

  // Datos de prueba en caso de que no se proporcionen
  const testStudent = {
    firstName: "Juan",
    lastName: "Pérez",
    course: "10° Grado",
    average: 4.2,
    attendance: 95,
    observationsCount: 3,
    family: ["María Pérez (Madre)", "Carlos Pérez (Padre)"],
    academicLevel: "Secundaria",
  };

  const studentData = student || testStudent;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Información Académica</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-600" />
            <span className="font-medium">
              {studentData.firstName} {studentData.lastName}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Curso</p>
              <p className="font-medium">{studentData.course}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Nivel Académico</p>
              <p className="font-medium">{studentData.academicLevel}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Promedio</p>
              <p className="font-medium">{studentData.average || "N/A"}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Asistencia</p>
              <p className="font-medium">{studentData.attendance || "N/A"}%</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Observaciones</p>
              <p className="font-medium">{studentData.observationsCount || 0}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg col-span-2">
              <p className="text-sm text-gray-500">Familiares</p>
              <p className="font-medium">
                {Array.isArray(studentData.family) ? studentData.family.join(", ") : "N/A"}
              </p>
            </div>
          </div>
        </div>
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
