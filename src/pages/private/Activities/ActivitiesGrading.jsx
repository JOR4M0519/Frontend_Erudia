import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { teacherDataService } from "../Dashboard/StudentLayout/StudentService";
import { BackButton } from "../../../components";
import { PrivateRoutes } from "../../../models";
import SubjectHeader from "../Subject/SubjectHeader";
import AchievementModal from "./AchievementModal";
import EvaluationSchemeModal from "./EvaluationSchemeModal";

export default function ActivitiesGrading() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [subject, setSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [isAchieveModalOpen, setIsAchieveModalOpen] = useState(false);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [comments, setComments] = useState({});
  const [isCompact, setIsCompact] = useState(false);



  useEffect(() => {
    if (!location.state?.activity || !location.state?.subject) {
      console.error("🚨 Error: No hay datos de actividad o materia.");
      navigate(PrivateRoutes.DASHBOARD);
      return;
    }
    setActivity(location.state.activity);
    setSubject(location.state.subject);
    
    // 🔹 Obtener lista de estudiantes y sus notas
    const fetchStudents = async () => {
      try {
        const studentList = await teacherDataService.getActivitiesScoresForGroup(
          location.state.activity.id,
          location.state.subject.group.id
        );
        setStudents(studentList || []);
        
        // Inicializar el estado de las calificaciones con las notas existentes
        const initialGrades = {};
        const initialComments = {};

        studentList.forEach(student => {
          if (student.score !== undefined) {
            initialGrades[student.studentId] = student.score;
            initialComments[student.studentId] = student.comment || ""; 
          }
        });
        setGrades(initialGrades);
        setComments(initialComments);
      } catch (error) {
        console.error("Error cargando estudiantes:", error);
      }
    };
    fetchStudents();
  }, [location.state, navigate]);

  // 🔹 Función para guardar calificaciones
  const handleSaveGrades = async () => {
    try {
      // Tu lógica para guardar las calificaciones
      console.log("Saving grades:", grades);
      // Simulación de guardado exitoso
      alert("Calificaciones guardadas con éxito");
    } catch (error) {
      console.error("Error al guardar calificaciones:", error);
      alert("Error al guardar las calificaciones");
    }
  };

    // Función para alternar entre vista normal y compacta
    const toggleCompactView = () => {
      setIsCompact(!isCompact);
    };
  
     // Renderizado de cada fila de estudiante
     const renderStudentRow = (student) => (
      <div className="py-2 px-3 flex flex-col md:flex-row md:items-center bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
        {/* Información del estudiante */}
        <div className="w-full md:w-1/5 mb-1 md:mb-0">
          <span className="font-medium text-gray-800 text-sm">
            {student.firstName} {student.lastName}
          </span>
        </div>
  
        <div className="w-full md:w-4/5 flex flex-col sm:flex-row gap-2">
          {/* 🔹 Área de Comentario - PRIMERO el comentario (sin etiqueta) */}
          <div className="flex-grow">
            <textarea
              id={`comment-${student.studentId}`}
              rows={isCompact ? "1" : "2"}
              className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 overflow-y-auto ${isCompact ? 'max-h-8' : ''}`}
              value={comments[student.studentId] || ''}
              onChange={(e) =>
                setComments({ ...comments, [student.studentId]: e.target.value })
              }
              aria-label={`Comentario para ${student.firstName} ${student.lastName}`}
            />
          </div>
  
          {/* 🔹 Input de Nota - DESPUÉS la nota (sin etiqueta) */}
          <div className="flex-none w-16">
            <input
              id={`grade-${student.studentId}`}
              type="number"
              min="0"
              max="10"
              step="0.1"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={grades[student.studentId] || ''}
              onChange={(e) => 
                setGrades({ ...grades, [student.studentId]: e.target.value })
              }
              aria-label={`Nota para ${student.firstName} ${student.lastName}`}
            />
          </div>
        </div>
      </div>
    );

  // 🔹 Botón de Logro
  const handleOpenLogro = () => {
    setIsAchieveModalOpen(true);
  };

  // 🔹 Función para guardar el logro
  const handleSaveLogro = async (data) => {
    try {
      // Aquí iría tu llamada a la API para actualizar el logro
      console.log("Guardando logro:", data);
      
      // Actualizar el estado local con el nuevo logro
      setActivity(prev => ({
        ...prev,
        achievement: data.achievement
      }));
      
      return true; // Indica éxito
    } catch (error) {
      console.error("Error al guardar el logro:", error);
      throw error; // Propaga el error para manejarlo en el componente del modal
    }
  };

  // 🔹 Botón de Esquema (si lo necesitas)
  const handleOpenScheme = () => {
    setIsSchemeModalOpen()
  };

  if (!activity || !subject) {
    return <p className="text-gray-500 text-center">Cargando información...</p>;
  }
  console.log(subject)
  return (
    <div className="space-y-6">
      {/* 🔹 Reutilizando SubjectHeader */}
      <SubjectHeader
        isTeacher={true} // O la condición que tengas para saber si es profesor
        subjectName={`${subject.subjectName} - ${activity.name}`}
        periodGrade={null} // Si no usas la nota de periodo aquí, puedes poner null
        activities={[activity]} // Si deseas que calcule un promedio de esta actividad (o más)
        groupInfo={subject.group} // Para mostrar info del grupo
        onOpenScheme={() => setIsSchemeModalOpen(true)} // Opcional
        onOpenLogro={handleOpenLogro}   // Opcional
      />
      
      <div className="max-w-6xl mx-auto">
      {/* 🔹 Lista de Estudiantes */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-800">Lista de estudiantes</h3>
          <button 
            onClick={toggleCompactView}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {isCompact ? "Expandir campos" : "Ajustar campos"}
          </button>
        </div>
        
        {/* Cabecera de la tabla */}
        <div className="py-2 px-3 flex flex-col md:flex-row md:items-center bg-gray-100 rounded-t-md font-medium text-gray-700 text-sm border-b-2 border-gray-200">
          <div className="w-full md:w-1/5 mb-1 md:mb-0">
            <span>Estudiante</span>
          </div>
          
          <div className="w-full md:w-4/5 flex flex-col sm:flex-row gap-2">
            <div className="flex-grow">
              <span>Comentario</span>
            </div>
            <div className="flex-none w-16 text-center">
              <span>Nota</span>
            </div>
          </div>
        </div>
        
        {/* Cuerpo de la tabla */}
        <div className="overflow-y-auto max-h-screen">
          {students.length > 0 ? (
            <div>
              {students.map((student) => (
                <div key={student.studentId}>
                  {renderStudentRow(student)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-4 text-sm">
              No hay estudiantes en este grupo.
            </p>
          )}
        </div>
      </div>
    </div>
  
      
      {/* 🔹 Botón para guardar calificaciones */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveGrades}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Guardar Calificaciones
        </button>
      </div>
      
      {/* 🔹 Botón de regreso */}
      <BackButton
        confirmExit={true}
        onClick={() =>
          navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT)
        }
      />
      
      {/* 🔹 Modal de Logro */}
      <AchievementModal 
        isOpen={isAchieveModalOpen}
        onClose={() => setIsAchieveModalOpen(false)}
        activity={activity}
        onSave={handleSaveLogro}
      />
      <EvaluationSchemeModal
        isOpen={isSchemeModalOpen}
        onClose={() => setIsSchemeModalOpen(false)}
        //Para el profesor
        groupId={subject.group?.id}
      />
    </div>
  );
}