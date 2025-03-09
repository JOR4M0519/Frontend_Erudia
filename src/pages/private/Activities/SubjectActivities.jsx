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
import { CreateActivityModal } from "./"; // Importamos el nuevo componente
import { StudentModal } from "../Dashboard/StudentLayout";

export default function SubjectActivities() {
  const [tasks, setTasks] = useState([]);
  const [periodGrade, setPeriodGrade] = useState("-");
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Estado para controlar el modal de creación
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const navigate = useNavigate();
  const userState = useSelector((store) => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];
  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);
  
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
    if (isTeacher) {
      // En lugar de pasar la función de actualización, usaremos un callback cuando regresemos
      navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_GRADING, {
        state: { 
          activity, 
          subject: selectedSubject,
          returnPath: PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT
        }
      });
    } else {
      const activityData = await fetchActivityDetail(activity.id, userState.id);
      if (activityData) {
        subjectActivityService.openTaskModal(activityData);
      }
    }
  };

  // Agregar un efecto para recargar las actividades cuando regresemos de la edición
  useEffect(() => {
    const loadActivities = async () => {
      if (!selectedSubject?.id || !selectedPeriod || !userState?.id || !isTeacher) return;
      
      try {
        const taskData = await teacherDataService.getActivities(
          selectedSubject.id,
          selectedPeriod,
          selectedSubject?.group?.id,
          userState.id,
          true
        );
        setTasks(Array.isArray(taskData) ? taskData : []);
      } catch (error) {
        console.error("Error recargando actividades:", error);
      }
    };

    loadActivities();
  }, [selectedSubject?.id, selectedPeriod, userState?.id, isTeacher]);

  const handleCreateActivity = (newActivity) => {
    setTasks(prevTasks => {
      // Transformar la nueva actividad al formato esperado por la lista
      const formattedActivity = {
        id: newActivity.id,
        name: newActivity.activityName || newActivity.name, // Manejar ambos formatos
        description: newActivity.description,
        startDate: newActivity.startDate,
        endDate: newActivity.endDate,
        status: newActivity.status || "A",
        achievementGroup: newActivity.achievementGroup,
        group: newActivity.group,
        score: [], // Array vacío para nuevas actividades
        comment: "-",
        // Agregar los campos adicionales que necesita la vista
        achievementId: newActivity.achievementGroup?.id,
        groupId: newActivity.group?.id,
        subjectId: selectedSubject?.id,
        periodId: selectedPeriod
      };
  
      // Verificar que todos los campos requeridos estén presentes
      console.log("Nueva actividad formateada:", formattedActivity);
      
      return [...prevTasks, formattedActivity];
    });
  };
  

  const handleItemClick = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);    
};

  return (
    <div className="space-y-6">
      {/* 🔹 Encabezado con la materia y nota */}
      <SubjectHeader
        isTeacher={isTeacher}
        groupInfo={selectedSubject?.group}
        activities={tasks}
        subjectName={selectedSubject?.subjectName}
        periodGrade={periodGrade}
        onOpenScheme={() => setIsSchemeModalOpen(true)}
      />

      {/* 🔹 Sección de Tareas (Misma para profesores y estudiantes) */}
      <ActivitiesList tasks={tasks} handleTaskClick={handleTaskClick} isTeacher={isTeacher} />

      {/* 🔹 Funcionalidades extra solo para profesores */}
      {isTeacher && (
        <TeacherActions
          handleItemClick={handleItemClick}
          onNavigateAssistance={() => navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ASISTANCE)}
          onCreateActivity={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* 🔹 Botón de regresar */}
      <BackButton onClick={() => navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.HOME)} />
      {/* 🔹 Modal de Esquema de Evaluación */}
      <EvaluationSchemeModal
        isOpen={isSchemeModalOpen}
        onClose={() => setIsSchemeModalOpen(false)}
        groupId={selectedSubject?.group?.id || studentDataService.getStudentDataValue()?.group?.id}
      />

      {/* 🔹 Modal de Creación de Actividad */}
      <CreateActivityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        courseDataBefore={selectedSubject}
        periodId={selectedPeriod}
        onSave={handleCreateActivity}
      />

      {selectedStudent && (
              <StudentModal
                student={selectedStudent}
                isOpen={showStudentModal}
                onClose={() => {
                  setShowStudentModal(false);
                  setSelectedStudent(null);
                }}
              />
            )}
    </div>
  );
}

/* Componente separado para las opciones del profesor */
function TeacherActions({handleItemClick, onNavigateAssistance, onCreateActivity }) {



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

      <StudentList onStudentClick={handleItemClick} />

      <div className="flex justify-end mt-4">
        <button
          onClick={onCreateActivity}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Crear actividad
        </button>
      </div>
      
    </div>
  );
}
