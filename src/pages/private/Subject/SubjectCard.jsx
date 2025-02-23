import React from "react";

/**
 * Componente reutilizable para mostrar materias con vistas diferentes para profesores y estudiantes
 * @param {Object} subject - Información de la materia
 * @param {Boolean} isTeacher - Indica si el usuario es un profesor
 * @param {Function} onClick - Función que se ejecuta al hacer click en la tarjeta
 */
const SubjectCard = ({ subject, isTeacher, onClick }) => {
  return (
    <div
      className="relative w-full h-48 cursor-pointer transition-transform hover:scale-105 
                 shadow-md hover:shadow-xl rounded-xl overflow-hidden border border-gray-300"
      onClick={() => onClick(subject)}
    >
      {/* 🔹 Imagen de fondo */}
      <div 
        className="absolute top-0 left-0 w-full h-2/3 bg-cover bg-center" 
        style={{ backgroundImage: `url('/bg-subject.png')` }}
      />

      {/* 🔹 Contenedor de texto con color original (gris claro) */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gray-300 flex flex-col justify-center p-4 rounded-b-xl text-gray-800">
        <h3 className="text-lg font-semibold">{subject.subjectName}</h3>
        
        {/*  Vista diferente para profesor o estudiante */}
        {isTeacher ? (
          <>
            <p className="text-sm">Clase: <span className="font-semibold">{subject.group?.groupName || "Sin grupo"}</span></p>
            <p className="text-xs text-gray-600">Nivel: {subject.group?.level?.levelName || "Desconocido"}</p>
          </>
        ) : (
          <>
            <p className="text-sm">Prof.: <span className="font-semibold">{subject.teacher?.firstName || "No asignado"} {subject.teacher?.lastName || ""}</span></p>
          </>
        )}
      </div>
    </div>
  );
};

export default SubjectCard;
