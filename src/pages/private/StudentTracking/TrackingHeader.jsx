import React from "react";
import { BookOpen, Users, Search, Calendar, Plus } from "lucide-react";

export default function TrackingHeader({
  isTeacher,
  userState,
  searchTerm,
  onSearchChange,
  onDateFilter,
  onCreateObservation,
}) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 transition-all hover:shadow-xl border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Información principal */}
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">
              {isTeacher ? "Seguimiento de Estudiantes" : "Observaciones del Estudiante"}
            </h2>
            {isTeacher && (
              <div className="flex items-center mt-2 bg-indigo-50 px-3 py-1 rounded-lg w-fit">
                <Users className="w-4 h-4 text-indigo-600 mr-2" />
                <span className="text-sm text-indigo-700 font-medium">
                  {userState.groupName || "Todos los grupos"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filtros y acciones */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-auto relative">
            <input
              type="text"
              placeholder={isTeacher ? "Buscar estudiante..." : "Buscar observación..."}
              value={searchTerm}
              onChange={onSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div className="w-full sm:w-auto relative">
            <input
              type="date"
              onChange={onDateFilter}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
            />
            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          {isTeacher && (
            <button
              onClick={onCreateObservation}
              className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 font-medium rounded-lg px-4 py-2 hover:bg-blue-100 transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Crear observación</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
