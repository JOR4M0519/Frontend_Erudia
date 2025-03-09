import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ChevronDown, ChevronUp, CheckSquare, XSquare, Clock } from "lucide-react";
import { teacherDataService } from "../StudentLayout/StudentService";
import { subjectActivityService } from "../../Subject";
import { BackButton } from "../../../../components";
import { useNavigate } from "react-router-dom";
import { PrivateRoutes } from "../../../../models";


export default function StudentList({ onStudentClick, showAttendance = false}) {
  const userState = useSelector((store) => store.selectedUser);
  const [studentList, setStudentList] = useState({ students: [] });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [attendance, setAttendance] = useState({}); // 🔹 Estado de asistencia


  // 🔹 Suscribirse a la materia seleccionada
  useEffect(() => {
    const subjectSubscription = subjectActivityService.getSelectedSubject().subscribe((subjectString) => {
      if (subjectString) {
        setSelectedSubject(JSON.parse(subjectString));
      }
    });

    return () => subjectSubscription.unsubscribe();
  }, []);

  // 🔹 Obtener la lista de estudiantes cuando cambia la materia seleccionada
  useEffect(() => {
    if (!selectedSubject?.id) return;

    const fetchStudents = async () => {
      try {
        await teacherDataService.fetchListUsersGroupData(selectedSubject.id);
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
      }
    };

    fetchStudents();
  }, [selectedSubject?.id, userState?.id]);

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

  // 🔹 Verificar si no hay estudiantes cargados
  if (!studentList.students || studentList.students.length === 0) {
    return <p className="text-gray-500 text-center">No hay estudiantes disponibles.</p>;
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
            className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-lg mb-2 transition-colors shadow-sm"
          >
            <span className="text-gray-700">
              {index + 1}. {student.name}
            </span>

            {showAttendance && (
              <button
                onClick={() => toggleAttendance(student.id)}
                className={`flex items-center gap-2 px-4 py-1 rounded-full ${getAttendanceStyle(attendance[student.id])}`}
              >
                {getAttendanceContent(attendance[student.id]).icon}
                {getAttendanceContent(attendance[student.id]).text}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}