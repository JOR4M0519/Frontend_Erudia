import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { studentDataService, teacherDataService } from "../Dashboard/StudentLayout/StudentService";
import { BackButton } from "../../../components";
import { configViewService } from "../Setting";
import { ActivitiesList, EvaluationSchemeModal } from ".";
import { useNavigate } from "react-router-dom";
import { subjectActivityService } from "../Subject";
import { hasAccess, decodeRoles } from "../../../utilities";
import { PrivateRoutes, Roles } from "../../../models";
import { CheckSquare, Plus } from "lucide-react"; // Íconos
import { StudentList } from "../Dashboard/TeacherLayout";
import SubjectHeader from "../Subject/SubjectHeader";


export default function SubjectActivities() {
  const [tasks, setTasks] = useState([]);
  const [periodGrade, setPeriodGrade] = useState("-");
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();
  const userState = useSelector((store) => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];
  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);
  
  const taskSample = [
    {
      "id": 1,
      "name": "Quiz Matemáticas",
      "description": "Prueba de álgebra",
      "startDate": "2025-02-05",
      "endDate": "2025-02-06",
      "score": [
        {
          "studentId": 1,
          "firstName": "Juanita",
          "lastName": "Andrea",
          "score": 4.5,
          "comment": "Buen desempeño"
        },
        {
          "studentId": 2,
          "firstName": "Carlos",
          "lastName": "Mendoza",
          "score": 3.2,
          "comment": "Puede mejorar"
        },
        {
          "studentId": 3,
          "firstName": "Sofía",
          "lastName": "Ramírez",
          "score": 2.8,
          "comment": "Requiere refuerzo"
        }
      ],
      "comment": "-",
      "status": "A"
    },
    {
      "id": 2,
      "name": "Ensayo de Historia",
      "description": "Escribir un ensayo sobre la independencia",
      "startDate": "2025-02-10",
      "endDate": "2025-02-12",
      "score": [
        {
          "studentId": 1,
          "firstName": "Juanita",
          "lastName": "Andrea",
          "score": 5.0,
          "comment": "Excelente redacción"
        },
        {
          "studentId": 2,
          "firstName": "Carlos",
          "lastName": "Mendoza",
          "score": 4.2,
          "comment": "Buen análisis"
        },
        {
          "studentId": 3,
          "firstName": "Sofía",
          "lastName": "Ramírez",
          "score": 3.5,
          "comment": "Ideas claras"
        }
      ],
      "comment": "-",
      "status": "A"
    },
    {
      "id": 3,
      "name": "Proyecto de Ciencias",
      "description": "Presentación sobre el sistema solar",
      "startDate": "2025-02-15",
      "endDate": "2025-02-20",
      "score": [
        {
          "studentId": 1,
          "firstName": "Juanita",
          "lastName": "Andrea",
          "score": 4.8,
          "comment": "Explicación clara"
        },
        {
          "studentId": 2,
          "firstName": "Carlos",
          "lastName": "Mendoza",
          "score": 3.9,
          "comment": "Buena presentación"
        },
        {
          "studentId": 3,
          "firstName": "Sofía",
          "lastName": "Ramírez",
          "score": 4.2,
          "comment": "Creativo"
        }
      ],
      "comment": "-",
      "status": "A"
    }
  ]
  

  useEffect(() => {
    const periodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
    const subjectSubscription = subjectActivityService.getSelectedSubject().subscribe((subjectString) => {
      if (subjectString) {
        setSelectedSubject(JSON.parse(subjectString));
      }
    });

    return () => {
      periodSubscription.unsubscribe();
      subjectSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectedSubject?.id || !selectedPeriod || !userState?.id) return;

    const fetchData = async () => {
      try {
        if (isTeacher) {
          const taskData = await teacherDataService.getActivities(
            selectedSubject.id,
            selectedPeriod,
            selectedSubject?.group?.id,
            userState.id,
            true
          );
          setTasks(Array.isArray(taskData) ? taskData : []);
          //setTasks(taskSample);
        } else {
          const grade = await studentDataService.getPeriodGrade(selectedSubject.id, selectedPeriod, userState.id);
          setPeriodGrade(grade);

          const taskData = await studentDataService.getActivities(
            selectedSubject.id,
            selectedPeriod,
            studentDataService.getStudentDataValue()?.group?.id,
            userState.id
          );
          setTasks(Array.isArray(taskData) ? taskData : []);
        }
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    };

    fetchData();
  }, [selectedPeriod, selectedSubject?.id, userState?.id, isTeacher]);

  const fetchActivityDetail = async (activityId, userId) => {
    try {
      const taskData = await studentDataService.getActivityDetailsStudent(activityId, userId);
      
      return taskData;
    } catch (error) {
      console.error("Error obteniendo detalles de la actividad:", error);
      return null;
    }
  };

  const handleTaskClick = async (activity) => {
    if (!userState?.id) {
      console.warn("Intento de obtener detalles de actividad sin userId");
      return;
    }
    console.log(activity,selectedSubject)
  
    if (isTeacher) {
      // 🔹 Si es PROFESOR, lo redirige a la vista de calificación con la actividad completa
      navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_GRADING, {
        state: { activity, subject: selectedSubject }, // Enviar toda la actividad
      });
    } else {
      // 🔹 Si es ESTUDIANTE, abre el modal con detalles de la actividad
      const activityData = await fetchActivityDetail(activity.id, userState.id);
      if (activityData) {
        subjectActivityService.openTaskModal(activityData);
      }
    }
  };
  
  

// Ejemplo de tarea para probar el modal
const sampleTask = {
  id: 1,
  name: "Sumemos y Restemos con Diversión",
  description: `Hoy vamos a practicar la suma y la resta con algunos ejercicios divertidos. Resuelve los siguientes problemas usando tus habilidades matemáticas. Puedes dibujar, usar tus dedos o fichas para ayudarte.

Instrucciones:
1. Resuelve las siguientes sumas y restas:
   • 12 + 5 = ___
   • 20 - 8 = ___
   • 7 + 9 = ___
   • 15 - 6 = ___

2. Escribe un problema de suma o resta y pídele a un amigo o familiar que lo resuelva.
1. Resuelve las siguientes sumas y restas:
   • 12 + 5 = ___
   • 20 - 8 = ___
   • 7 + 9 = ___
   • 15 - 6 = ___

2. Escribe un problema de suma o resta y pídele a un amigo o familiar que lo resuelva.1. Resuelve las siguientes sumas y restas:
   • 12 + 5 = ___
   • 20 - 8 = ___
   • 7 + 9 = ___
   • 15 - 6 = ___

2. Escribe un problema de suma o resta y pídele a un amigo o familiar que lo resuelva.1. Resuelve las siguientes sumas y restas:
   • 12 + 5 = ___
   • 20 - 8 = ___
   • 7 + 9 = ___
   • 15 - 6 = ___

2. Escribe un problema de suma o resta y pídele a un amigo o familiar que lo resuelva.
3. Dibuja un ejemplo de una suma o una resta usando objetos (como manzanas, juguetes o pelotas).`,
  startDate: "2024-01-15T00:00:00",
  endDate: "2024-01-21T23:59:59",
  status: "Entrega Lunes 21 de enero",
  score: "-",
  subjectName: "Matemáticas",
  comment: "Sin estado",
  activity: {
    activityName: "Sumemos y Restemos con Diversión",
    subject: {
      subjectName: "Matemáticas"
    }
  }
};
return (
  <div className="space-y-6">
    {/* 🔹 Encabezado con la materia y nota */}
    <SubjectHeader
      subjectName={selectedSubject?.subjectName}
      periodGrade={periodGrade}
      onOpenScheme={() => setIsSchemeModalOpen(true)}
    />

    {/* 🔹 Sección de Tareas (Misma para profesores y estudiantes) */}
    <ActivitiesList tasks={tasks} handleTaskClick={handleTaskClick} isTeacher={isTeacher} />


    {/* 🔹 Funcionalidades extra solo para profesores */}
    {isTeacher && (
      <TeacherActions onNavigateAssistance={() => navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ASISTANCE)} />
    )}

    {/* 🔹 Botón de regresar */}
    <BackButton onClick={() => navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.HOME)} />

    {/* 🔹 Modal de Esquema de Evaluación */}
    <EvaluationSchemeModal
      isOpen={isSchemeModalOpen}
      onClose={() => setIsSchemeModalOpen(false)}
      subjectId={selectedSubject?.id || 1}
      groupId={studentDataService.getStudentDataValue()?.group?.id}
      periodId={selectedPeriod}
    />
  </div>
);
}


/* 🔹 Componente separado para las opciones del profesor */
function TeacherActions({ onNavigateAssistance }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-700">Lista de estudiantes</h3>
        <button
          onClick={onNavigateAssistance}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all"
        >
          <CheckSquare className="w-5 h-5" />
          Asistencia
        </button>
      </div>

      <StudentList onStudentClick={(student) => console.log("Ver detalles de:", student)} />

      <div className="flex justify-end mt-4">
        <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all">
          <Plus className="w-5 h-5" />
          Crear actividad
        </button>
      </div>
    </div>
  );
}
