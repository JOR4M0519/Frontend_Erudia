import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AttendanceHistoryModal, StudentList } from "./";
import { BackButton } from "../../../../components";
import { useNavigate } from "react-router-dom";
import { teacherDataService } from "../StudentLayout";
import AttendanceHeader from "./AttendaceHeader";
import { subjectActivityService } from "../../Subject";
import { PrivateRoutes } from "../../../../models";
import { configViewService } from "../../Setting";
import { Loader } from "lucide-react"; // Asegúrate de importar el ícono de loading

export default function AsistanceGrid() {
    const [students, setStudents] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [attendance, setAttendance] = useState({});
    const [isLoading, setIsLoading] = useState(true); // Nuevo estado para loading
    const navigate = useNavigate();
    const [selectedSubject, setSelectedSubject] = useState(null);
    const selectedDateRedux = useSelector((state) => (state.date.selectedDate));
    const [selectedDate, setSelectedDate] = useState(selectedDateRedux);
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    // 🔹 Suscribirse a la materia seleccionada y al período
    useEffect(() => {
        const subjectSubscription = subjectActivityService.getSelectedSubject().subscribe((subjectString) => {
            if (subjectString) {
                setSelectedSubject(JSON.parse(subjectString));
                setIsLoading(false);
            }
        });

        const periodSubscription = configViewService.getSelectedPeriod().subscribe((period) => {
            setSelectedPeriod(period);
        });

        return () => {
            subjectSubscription.unsubscribe();
            periodSubscription.unsubscribe();
        };
    }, []);

    // 🔹 Obtener la lista de estudiantes al cargar el componente
    useEffect(() => {
        const subscription = teacherDataService.getStudentGroupListData().subscribe((data) => {
            if (data?.students) {
                setStudents(data.students);
                const initialAttendance = data.students.reduce((acc, student) => {
                    acc[student.id] = false;
                    return acc;
                }, {});
                setAttendance(initialAttendance);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

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

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-2">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Cargando información...</p>
                </div>
            </div>
        );
    }

    // Error state - No subject selected
    if (!selectedSubject) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        No hay materia seleccionada
                    </h2>
                    <p className="text-gray-600">
                        Por favor, seleccione una materia para continuar.
                    </p>
                </div>
                <BackButton
                    onClick={() => navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT)}
                    confirmExit={false}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AttendanceHeader 
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                subject={selectedSubject}
            />

            <StudentList 
                showAttendance={true}
                onStudentClick={toggleAttendance}
            />

            <div className="flex justify-end gap-4">
                <button
                    onClick={() => setShowHistory(true)}
                    className="px-6 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                >
                    Ver Historial
                </button>
                <button 
                    onClick={handleSave} 
                    className="px-6 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                >
                    Guardar
                </button>
            </div>

            <BackButton
                onClick={() => navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT)}
                confirmExit={true}
            />

            {/* Solo renderizar el modal si tenemos todos los datos necesarios */}
            {showHistory && selectedSubject && selectedPeriod && (
                <AttendanceHistoryModal
                    isOpen={showHistory}
                    onClose={() => setShowHistory(false)}
                    group={selectedSubject.group.id}
                    subject={selectedSubject.id}
                    period={selectedPeriod}
                />
            )}
        </div>
    );
}