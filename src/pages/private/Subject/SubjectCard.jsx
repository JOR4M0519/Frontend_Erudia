import React from "react";
import { Book, Users, ChevronRight } from "lucide-react";

// Paleta de colores para las tarjetas (colores que combinan bien)
const CARD_COLORS = [
  { bg: "from-blue-50 to-blue-100", accent: "bg-blue-500", text: "text-blue-700" },
  { bg: "from-emerald-50 to-emerald-100", accent: "bg-emerald-500", text: "text-emerald-700" },
  { bg: "from-amber-50 to-amber-100", accent: "bg-amber-500", text: "text-amber-700" },
  { bg: "from-violet-50 to-violet-100", accent: "bg-violet-500", text: "text-violet-700" },
  { bg: "from-rose-50 to-rose-100", accent: "bg-rose-500", text: "text-rose-700" },
  { bg: "from-cyan-50 to-cyan-100", accent: "bg-cyan-500", text: "text-cyan-700" },
];

/**
 * Obtiene un color consistente basado en un ID
 */
const getConsistentColor = (id) => {
  // Verificar si id existe para evitar errores
  if (id === undefined || id === null) {
    return CARD_COLORS[0]; // Color por defecto
  }
  const colorIndex = (typeof id === 'number' ? id : parseInt(id.toString().replace(/[^\d]/g, '') || '0', 10)) % CARD_COLORS.length;
  return CARD_COLORS[colorIndex];
};

/**
 * Tarjeta de Grupo con sus materias
 */
const GroupCard = ({ group, subjects = [], isTeacher, onSubjectClick, isExpanded, onToggle }) => {
  // Verificar que group exista para evitar errores
  if (!group) {
    return null;
  }
  
  const colorScheme = getConsistentColor(group.id);
  
  return (
    <div className={`overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out 
                    border border-gray-200 ${isExpanded ? 'mb-8' : 'mb-4 hover:shadow-xl'}`}>
      {/* Cabecera del grupo */}
      <div 
        className={`bg-gradient-to-r ${colorScheme.bg} p-4 cursor-pointer`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${colorScheme.accent} h-10 w-10 rounded-full flex items-center justify-center`}>
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${colorScheme.text}`}>{group.groupName || "Sin nombre"}</h3>
              <p className="text-gray-600 text-sm">
                {group.level?.levelName || "Sin nivel"} • {group.groupCode || ""}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-500">
              {subjects.length} {subjects.length === 1 ? 'materia' : 'materias'}
            </span>
            <ChevronRight 
              size={20} 
              className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} 
            />
          </div>
        </div>
      </div>

      {/* Lista de materias (expandible) */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out
                   ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
      >
        <div className="divide-y divide-gray-100">
          {Array.isArray(subjects) && subjects.map((subject) => (
            <SubjectItem 
              key={isTeacher 
                ? `${subject?.id || subject?.subjectProfessor?.subject?.id || Math.random()}-${subject?.groups?.id || 0}` 
                : `${subject?.id || Math.random()}-${subject?.group?.id || 0}`} 
              subject={subject} 
              colorScheme={colorScheme}
              isTeacher={isTeacher}
              onClick={() => onSubjectClick(subject)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Elemento de materia dentro de un grupo
 */
const SubjectItem = ({ subject, colorScheme, isTeacher, onClick }) => {
  // Verificar que subject exista para evitar errores
  if (!subject) {
    return null;
  }
  
  // Adaptación para profesores y estudiantes con verificaciones
  const subjectName = isTeacher 
    ? (subject.subjectProfessor?.subject?.subjectName || subject.subjectName || "Sin nombre") 
    : (subject.subjectName || "Sin nombre");
    
  const teacherName = isTeacher 
    ? null 
    : `${subject.teacher?.firstName || ""} ${subject.teacher?.lastName || ""}`;

  return (
    <div 
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 flex justify-between items-center"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`${colorScheme.accent} h-8 w-8 rounded-full flex items-center justify-center opacity-80`}>
          <Book size={16} className="text-white" />
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{subjectName}</h4>
          {teacherName && <p className="text-sm text-gray-500">Prof. {teacherName}</p>}
        </div>
      </div>
      <ChevronRight size={16} className={`${colorScheme.text} opacity-70`} />
    </div>
  );
};

/**
 * Tarjeta de Materia individual (para vista de materias)
 */
const SubjectCard = ({ subject, group, isTeacher, onClick }) => {
  // Si es una tarjeta de grupo, usar el componente antiguo que ya funcionaba
  if (group) {
    return (
      <div
        className="relative w-full h-48 cursor-pointer transition-transform hover:scale-105 
                 shadow-md hover:shadow-xl rounded-xl overflow-hidden border border-gray-300"
        onClick={() => onClick(group)}
      >
        {/* Imagen de fondo */}
        <div
          className="absolute top-0 left-0 w-full h-2/3 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg-subject.png')" }}
        />
        
        {/* Información del grupo */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gray-300 flex flex-col justify-center p-4 rounded-b-xl text-gray-800">
          <h3 className="text-lg font-semibold">{group.groupName || "Sin nombre"} ({group.groupCode || ""})</h3>
          <p className="text-sm">Nivel: <span className="font-semibold">{group.level || "Desconocido"}</span></p>
          {isTeacher && (
            <p className="text-xs text-gray-600">Estudiantes: {group.students?.length || 0}</p>
          )}
        </div>
      </div>
    );
  }
  
  // Verificar que subject exista para evitar errores
  if (!subject) {
    return null;
  }
  
  // Adaptación para profesores y estudiantes con verificaciones
  const subjectId = isTeacher 
    ? (subject.subjectProfessor?.subject?.id || subject.id || Math.random()) 
    : (subject.id || Math.random());
  
  const colorScheme = getConsistentColor(subjectId);
  
  // Extraer datos según el formato (profesor o estudiante) con verificaciones
  const subjectName = isTeacher 
    ? (subject.subjectProfessor?.subject?.subjectName || subject.subjectName || "Sin nombre") 
    : (subject.subjectName || "Sin nombre");
    
  const groupName = isTeacher
    ? (subject.group?.groupName || "Sin grupo")
    : (subject.group?.groupName || "Sin grupo");
    
  const levelName = isTeacher
    ? (subject.group?.level?.levelName || "Sin nivel")
    : (subject.group?.level?.levelName || "Sin nivel");
    
  const teacherName = isTeacher 
    ? null 
    : `${subject.teacher?.firstName || ""} ${subject.teacher?.lastName || ""}`;

  return (
    <div 
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 
                 border border-gray-200 overflow-hidden cursor-pointer transform hover:scale-102`}
      onClick={() => onClick(subject)}
    >
      <div className={`h-2 ${colorScheme.accent}`}></div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-2">{subjectName}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Users size={16} className="mr-2" />
          <span>{groupName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {levelName}
          </span>
          {teacherName && (
            <span className="text-xs text-gray-500">
              Prof. {teacherName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Exportar componentes para uso en SubjectGrid
export { GroupCard, SubjectCard };
