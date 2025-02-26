import React from "react";
import StudentItem from "./StudentItem";

export default function StudentList({
  observations,
  isTeacher,
  onEditObservation,
  onDeleteObservation,
  onItemClick,
}) {
  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
      <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-gray-600 border-b border-gray-200">
        {isTeacher ? (
          <>
            <div className="col-span-3">Estudiante</div>
            <div className="col-span-3">Observador</div>
            <div className="col-span-2 text-center">Fecha</div>
            <div className="col-span-2 text-center">Curso</div>
            <div className="col-span-2 text-center">Acciones</div>
          </>
        ) : (
          <>
            <div className="col-span-4">Observador</div>
            <div className="col-span-4 text-center">Fecha</div>
            <div className="col-span-4 text-center">Profesor</div>
          </>
        )}
      </div>
      <div className="divide-y divide-gray-200">
        {observations.length > 0 ? (
          observations.map((obs) => (
            <StudentItem
              key={obs.id}
              observation={obs}
              isTeacher={isTeacher}
              onEditObservation={onEditObservation}
              onDeleteObservation={onDeleteObservation}
              onItemClick={onItemClick}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center p-4">No hay observaciones disponibles.</p>
        )}
      </div>
    </div>
  );
}
