import StudentItem from "./StudentItem";

export default function StudentList({
  observations,
  isTeacher,
  onEditObservation,
  onDeleteObservation,
  onItemClick,
  isLoading, // Agregar esta prop
}) {
  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto p-4">
      <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-gray-600 border-b border-gray-200">
        {isTeacher ? (
          <>
            <div className="col-span-3">Estudiante</div>
            <div className="col-span-3">Situación</div>
            <div className="col-span-2 text-center">Fecha</div>
            <div className="col-span-2 text-center">Tipo</div>
            <div className="col-span-2 text-center">Acciones</div>
          </>
        ) : (
          <>
            <div className="col-span-4">Situación</div>
            <div className="col-span-4 text-center">Fecha</div>
            <div className="col-span-4 text-center">Profesor</div>
          </>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {isLoading ? (
          // Componente de carga
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Cargando observaciones</h3>
            <p className="text-gray-500 text-center">
              Estamos recuperando la información, por favor espere...
            </p>
          </div>
        ) : observations.length > 0 ? (
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
          // Mensaje de "no hay observaciones"
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="bg-gray-200 rounded-full p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Sin observaciones</h3>
            <p className="text-gray-500 text-center max-w-md">
              {isTeacher 
                ? "No hay observaciones registradas para este estudiante. Puedes crear una nueva observación usando el botón de arriba."
                : "No hay observaciones registradas en tu historial académico actualmente."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
