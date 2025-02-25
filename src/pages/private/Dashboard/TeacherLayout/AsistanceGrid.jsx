import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AttendanceHistoryModal, StudentList } from "./";
import { BackButton } from "../../../../components";
import { useNavigate } from "react-router-dom";
import { teacherDataService } from "../StudentLayout";
import AttendanceHeader from "./AttendaceHeader";
import { subjectActivityService } from "../../Subject";
import { PrivateRoutes } from "../../../../models";
//import { teacherDataService } from "../Dashboard/StudentLayout/StudentService";


export default function AsistanceGrid() {
    const [students, setStudents] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [attendance, setAttendance] = useState({});
    const userState = useSelector((store) => store.selectedUser);
    const navigate = useNavigate();
    const [selectedSubject, setSelectedSubject] = useState(null);
    const selectedDateRedux = useSelector((state) => (state.date.selectedDate));
    const [selectedDate, setSelectedDate] = useState(selectedDateRedux);

      // 🔹 Suscribirse a la materia seleccionada
  useEffect(() => {
    const subjectSubscription = subjectActivityService.getSelectedSubject().subscribe((subjectString) => {
      if (subjectString) {
        setSelectedSubject(JSON.parse(subjectString));
      }
    });

    return () => subjectSubscription.unsubscribe();
  }, []);
    // 🔹 Obtener la lista de estudiantes al cargar el componente
    useEffect(() => {
        const subscription = teacherDataService.getStudentGroupListData().subscribe((data) => {
            if (data?.students) {
                setStudents(data.students);

                // 🔹 Inicializar estado de asistencia (todos "ausentes" por defecto)
                const initialAttendance = data.students.reduce((acc, student) => {
                    acc[student.id] = false;
                    return acc;
                }, {});
                setAttendance(initialAttendance);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 🔹 Alternar asistencia de un estudiante
    const toggleAttendance = (studentId) => {
        setAttendance((prev) => ({
            ...prev,
            [studentId]: !prev[studentId],
        }));
    };

    const handleSave = () => {
        console.log("Guardando asistencia:", attendance);
        // 🔹 TODO: Implementar lógica de guardado
    };


    return (
        <div className="space-y-6">
            {/* 🔹 Header */}
            {/* <div className="bg-gray-200 p-4 rounded-xl flex justify-between items-center">
                <h2 className="text-lg font-medium">Lista de estudiantes</h2>
                <span className="text-lg font-medium">Fecha: {Date.now()}</span>
                <span className="text-lg font-medium">Asistencia</span>
            </div> */}


            <AttendanceHeader selectedDate={selectedDate}
             setSelectedDate={setSelectedDate}
             subject={selectedSubject}
              />

            {/* 🔹 Sección de estudiantes con asistencia */}
            <StudentList showAttendance={true}
                onStudentClick={toggleAttendance} //  `toggleAttendance` ahora maneja clics
            />

            {/* 🔹 Botones de acción */}
            <div className="flex justify-end gap-4">
                <button
                    onClick={() => setShowHistory(true)}
                    className="px-6 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                >
                    Ver Historial
                </button>
                <button onClick={handleSave} className="px-6 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                    Guardar
                </button>
            </div>

            <BackButton
                onClick={() => navigate(PrivateRoutes.DASHBOARD+PrivateRoutes.ACTIVITIES_SUBJECT)} 
                confirmExit={true} 
            />
            <AttendanceHistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} students={students} />
        </div>
    );
}
