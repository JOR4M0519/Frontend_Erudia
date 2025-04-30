import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ChevronDown, ChevronUp, CheckSquare, XSquare, Clock, Users } from "lucide-react";
import { teacherDataService } from "../StudentLayout/StudentService";
import { subjectActivityService } from "../../Subject";
import { BackButton } from "../../../../components";
import { useNavigate } from "react-router-dom";
import { PrivateRoutes } from "../../../../models";
import { configViewService } from "../../Setting";


export default function StudentList({ onStudentClick, showAttendance = false, isDirectionGroup = false }) {
  const userState = useSelector((store) => store.selectedUser);
  const [studentList, setStudentList] = useState({ students: [] });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [attendance, setAttendance] = useState({}); //  Estado de asistencia
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  // Suscribirse a la materia y periodo seleccionada
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

  // Obtener la lista de estudiantes cuando cambia la materia seleccionada
  useEffect(() => {
    if (!selectedSubject?.id) return;

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // Usar endpoint diferente según si viene de dirección de grupo o no
        if (isDirectionGroup) {
          // Para dirección de grupo, usamos el método por ID de grupo
          await teacherDataService.fetchListUsersGroupDataByGroupId(selectedSubject.id);
        } else {
          // Para materias normales, usamos el método por periodo y materia
          console.log(selectedSubject)
          await teacherDataService.fetchListUsersGroupDataBySubject(selectedPeriod, selectedSubject.id,selectedSubject.group.id);
        }
        const updatedList = teacherDataService.getStudentGroupListValue();
        if (updatedList) {
          setStudentList(updatedList);

          // Inicializar todos como presentes
          const initialAttendance = updatedList.students.reduce((acc, student) => {
            acc[student.id] = 'P'; // Presente por defecto
            return acc;
          }, {});
          setAttendance(initialAttendance);
        }
        
      } catch (error) {
        console.error("Error al obtener la lista de estudiantes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSubject?.id, userState?.id, isDirectionGroup, selectedPeriod]);

  // Función para cambiar el estado de asistencia
  const toggleAttendance = (studentId) => {
    const currentStatus = attendance[studentId];
    const newStatus = currentStatus === 'P' ? 'A' : currentStatus === 'A' ? 'T' : 'P';
  
    setAttendance(prev => ({
      ...prev,
      [studentId]: newStatus
    }));

    // Notificar al padre del cambio
    onStudentClick(studentId, newStatus);
  };

  // Función para cambiar todos los estados
  const setAllAttendance = (status) => {
    const newAttendance = {};
    studentList.students.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  
    // Notificar al padre de todos los cambios
    studentList.students.forEach(student => {
      onStudentClick(student.id, status);
    });
  };

  // Función para obtener el estilo del botón de asistencia
  const getAttendanceStyle = (status) => {
    switch (status) {
      case 'P':
        return "bg-green-500 text-white";
      case 'A':
        return "bg-red-500 text-white";
      case 'T':
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Función para obtener el icono y texto del estado
  const getAttendanceContent = (status) => {
    switch (status) {
      case 'P':
        return { icon: <CheckSquare className="w-5 h-5" />, text: "Presente" };
      case 'A':
        return { icon: <XSquare className="w-5 h-5" />, text: "Ausente" };
      case 'T':
        return { icon: <Clock className="w-5 h-5" />, text: "Tarde" };
      default:
        return { icon: <CheckSquare className="w-5 h-5" />, text: "Presente" };
    }
  };

  //  Verificar si no hay estudiantes cargados
if (!studentList.students || studentList.students.length === 0) {
  return (
    <>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 font-medium">Cargando lista de estudiantes</p>
        </div>
      ) : (
        <div className="text-center p-6">
          <div className="bg-gray-200 rounded-full p-3 inline-flex mb-3">
            <Users className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
          </div>
          <p className="text-gray-700 font-medium">No hay estudiantes para mostrar</p>
          <p className="text-gray-500 text-sm mt-1">Verifica los filtros aplicados o espera a que se asignen estudiantes</p>
        </div>
      )}
    </>
  );
}

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-gray-700 font-medium transition-all"
        >
          Lista de estudiantes
          {isExpanded ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
        </button>

        {showAttendance && (
          <div className="flex gap-2">
            <button
              onClick={() => setAllAttendance('P')}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Todos Presentes
            </button>
            <button
              onClick={() => setAllAttendance('T')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            >
              Todos Tarde
            </button>
            <button
              onClick={() => setAllAttendance('A')}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Todos Ausentes
            </button>
          </div>
        )}
      </div>

      <div className={`transition-all overflow-hidden ${isExpanded ? "max-h-screen" : "max-h-0"}`}>
       {studentList.students.map((student, index) => (
  <div
    key={student.id}
    className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-lg mb-2 transition-colors shadow-sm cursor-pointer"
    onClick={() => !showAttendance && onStudentClick(student)} // Add this line to make it clickable
  >
    <span className="text-gray-700">
      {index + 1}. {student.name}
    </span>

    {showAttendance && (
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the parent div's onClick
          toggleAttendance(student.id);
        }}
        className={`flex items-center gap-2 px-4 py-1 rounded-full ${getAttendanceStyle(attendance[student.id])}`}
      >
        {getAttendanceContent(attendance[student.id]).icon}
        {getAttendanceContent(attendance[student.id]).text}
      </button>
    )}
    
    {/* Add buttons for viewing student info and grades when not in attendance mode */}
    {!showAttendance && (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStudentClick(student);
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          Ver Información
        </button>
        {isDirectionGroup &&(<button
          onClick={(e) => {
            e.stopPropagation();
            onStudentClick(student, 'grades');
          }}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
        >
          Ver Calificaciones
        </button>)}
      </div>
    )}
  </div>
))}
      </div>
    </div>
  );
}