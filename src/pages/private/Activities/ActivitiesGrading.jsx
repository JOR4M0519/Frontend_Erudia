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
        studentList.forEach(student => {
          if (student.score !== undefined) {
            initialGrades[student.studentId] = student.score;
          }
        });
        setGrades(initialGrades);
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
      
      {/* 🔹 Lista de Estudiantes */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-2">Lista de estudiantes</h3>
        <div className="divide-y divide-gray-200">
          {students.length > 0 ? (
            students.map((student) => (
              <div
                key={student.studentId}
                className="flex justify-between items-center p-2"
              >
                <span>
                  {student.firstName} {student.lastName}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    className="border p-1 rounded w-20"
                    placeholder="Nota"
                    value={grades[student.studentId] || ""}
                    onChange={(e) =>
                      setGrades({ ...grades, [student.studentId]: e.target.value })
                    }
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center p-4">
              No hay estudiantes en este grupo.
            </p>
          )}
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