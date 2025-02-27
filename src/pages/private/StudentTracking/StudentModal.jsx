import React from "react";
import { User } from "lucide-react";

export default function StudentModal({ student, isOpen, onClose }) {
  if (!isOpen) return null;


  /* Modal estudiante Observador */
  //Grupo - Nivel academico
  //Familiares estudiante
  //# de observaciones de un año
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Información Académica</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-600" />
            <span className="font-medium">
              {student.firstName} {student.lastName}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Curso</p>
              <p className="font-medium">{student.course}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Promedio</p>
              <p className="font-medium">{student.average || "N/A"}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Asistencia</p>
              <p className="font-medium">{student.attendance || "N/A"}%</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Observaciones</p>
              <p className="font-medium">{student.observationsCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
