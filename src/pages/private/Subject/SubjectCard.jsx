import React from "react";

/**
 * Contenedor principal de la tarjeta con diseño y evento `onClick`.
 */
const CardContainer = ({ children, onClick }) => (
  <div
    className="relative w-full h-48 cursor-pointer transition-transform hover:scale-105 
               shadow-md hover:shadow-xl rounded-xl overflow-hidden border border-gray-300"
    onClick={onClick}
  >
    {children}
  </div>
);

/**
 * Imagen de fondo de la tarjeta.
 */
const CardImage = () => (
  <div
    className="absolute top-0 left-0 w-full h-2/3 bg-cover bg-center"
    style={{ backgroundImage: "url('/bg-subject.png')" }}
  />
);

/**
 * Información del grupo (Dirección de Curso).
 */
const GroupInfo = ({ group, isTeacher }) => (
  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gray-300 flex flex-col justify-center p-4 rounded-b-xl text-gray-800">
    <h3 className="text-lg font-semibold">{group.groupName} ({group.groupCode})</h3>
    <p className="text-sm">Nivel: <span className="font-semibold">{group.level || "Desconocido"}</span></p>
    {isTeacher && (
      <p className="text-xs text-gray-600">Estudiantes: {group.students?.length || 0}</p>
    )}
  </div>
);

/**
 * Información de la materia.
 */
const SubjectInfo = ({ subject, isTeacher }) => (
  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gray-300 flex flex-col justify-center p-4 rounded-b-xl text-gray-800">
    <h3 className="text-lg font-semibold">{subject.subjectName}</h3>
    {isTeacher ? (
      <>
        <p className="text-sm">Clase: <span className="font-semibold">{subject.group?.groupName || "Sin grupo"}</span></p>
        <p className="text-sm">Nivel: <span className="font-semibold">{subject.group?.level?.levelName || "Desconocido"}</span></p>
      </>
    ) : (
      <p className="text-sm">Prof.: <span className="font-semibold">{subject.teacher?.firstName || "No asignado"} {subject.teacher?.lastName || ""}</span></p>
    )}
  </div>
);

/**
 * Componente principal que maneja la lógica para mostrar un grupo o una materia.
 */
const SubjectCard = ({ group, subject, isTeacher, onClick }) => {
  const isGroupView = !!group; // 🔹 Determina si se muestra un grupo o una materia.

  return (
    <CardContainer onClick={() => onClick(group || subject)}>
      <CardImage />
      {isGroupView ? <GroupInfo group={group} isTeacher={isTeacher} /> : <SubjectInfo subject={subject} isTeacher={isTeacher} />}
    </CardContainer>
  );
};

export default SubjectCard;
