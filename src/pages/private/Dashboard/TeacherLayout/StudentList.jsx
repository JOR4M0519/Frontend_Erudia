import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ChevronDown, ChevronUp, CheckSquare, XSquare } from "lucide-react";
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

          // 🔹 Inicializa la asistencia en "ausente" por defecto
          const initialAttendance = updatedList.students.reduce((acc, student) => {
            acc[student.id] = false;
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

  // 🔹 Alternar asistencia de un estudiante
  const toggleAttendance = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // 🔹 Verificar si no hay estudiantes cargados
  if (!studentList.students || studentList.students.length === 0) {
    return <p className="text-gray-500 text-center">No hay estudiantes disponibles.</p>;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      {/* 🔹 Botón para Expandir/Colapsar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-gray-700 font-medium transition-all"
      >
        Lista de estudiantes
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* 🔹 Contenedor Expandible */}
      <div className={`transition-all overflow-hidden ${isExpanded ? "max-h-screen mt-2" : "max-h-0"}`}>
        {studentList.students.length === 0 ? (
          <p className="text-gray-500 text-center p-2">No hay estudiantes disponibles.</p>
        ) : (
          <div className="space-y-2 mt-2">
            {studentList.students.map((student, index) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-white hover:bg-gray-200 rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                <span className="text-gray-700">
                  {index + 1}. {student.name}
                </span>

                {/* 🔹 Si `showAttendance` es true, mostrar botones de asistencia */}
                {showAttendance ? (
                  <button
                    onClick={() => toggleAttendance(student.id)}
                    className={`flex items-center gap-2 px-4 py-1 rounded-full ${
                      attendance[student.id] ? "bg-red-500 text-white" : "bg-green-500 text-white"
                    }`}
                  >
                    {attendance[student.id] ? (
                      <>
                        <XSquare className="w-5 h-5" /> Ausente
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-5 h-5" /> Presente
                      </>
                    )}
                  </button>
                ) : (
                  <button onClick={() => onStudentClick && onStudentClick(student)} className="text-gray-400 hover:text-gray-600">
                    Ver Detalle
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
