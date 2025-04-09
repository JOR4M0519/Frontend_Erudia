import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AttendanceHistoryModal, attendanceService, StudentList } from "./";
import { BackButton } from "../../../../components";
import { useNavigate } from "react-router-dom";
import { teacherDataService } from "../StudentLayout";
import AttendanceHeader from "./AttendaceHeader";
import { subjectActivityService } from "../../Subject";
import { PrivateRoutes } from "../../../../models";
import { configViewService } from "../../Setting";
import { Loader } from "lucide-react"; // Asegúrate de importar el ícono de loading
import Swal from "sweetalert2";

export default function AsistanceGrid() {
    const [students, setStudents] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [attendance, setAttendance] = useState({});
    const [isLoading, setIsLoading] = useState(true); // Para carga inicial
    const [isSaving, setIsSaving] = useState(false); // Para el proceso de guardado
    const navigate = useNavigate();
    const [selectedSubject, setSelectedSubject] = useState(null);
    const userState = useSelector((state) => state.user); // Agregar este selector si no lo tienes
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
    // En el useEffect donde se cargan los estudiantes
    // Modificar el useEffect de carga de estudiantes
    useEffect(() => {
        if (!selectedSubject?.id) {
            console.log("No hay materia seleccionada, esperando...");
            return;
        }

        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                await teacherDataService.fetchListUsersGroupData(selectedPeriod, selectedSubject.id);
                const updatedList = teacherDataService.getStudentGroupListValue();

                if (updatedList?.students) {
                    setStudents(updatedList.students);

                    // Inicializar todos como presentes
                    const initialAttendance = updatedList.students.reduce((acc, student) => {
                        acc[student.id] = 'P'; // Inicializar como Presente
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
    }, [selectedSubject?.id, userState?.id]);

    const toggleAttendance = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = async () => {
        try {
          // Validaciones iniciales
          const validationChecks = [
            { condition: !students.length, message: 'No hay estudiantes para guardar' },
            { condition: !selectedSubject?.id, message: 'No hay materia seleccionada' },
            { condition: !selectedDate, message: 'No hay fecha seleccionada' },
            { condition: !selectedPeriod, message: 'No hay periodo seleccionado' },
            { condition: !userState?.id, message: 'No se encontró información del profesor' }
          ];
      
          // Verificar cada validación
          for (const check of validationChecks) {
            if (check.condition) {
              await Swal.fire({
                title: 'Error',
                text: check.message,
                icon: 'error'
              });
              return;
            }
          }
      
          // Activar estado de guardado
          setIsSaving(true);
          
          // Crear array de registros de asistencia
          const attendanceRecords = students.map(student => ({
            student: { id: student.id },
            attendanceDate: selectedDate,
            status: attendance[student.id] || 'P',
            recordedAt: new Date(new Date().setHours(new Date().getHours() - 5)).toISOString() // Ajuste a hora Colombia
          }));
          
          // Mostrar progreso
          const loadingSwal = Swal.fire({
            title: 'Guardando asistencia',
            text: 'Por favor espere...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
          });
          
          // Llamado al backend
          const response = await attendanceService.saveAttendanceBatch(
            attendanceRecords,
            selectedSubject.group.id,
            selectedSubject.id,
            userState.id,
            selectedPeriod
          );
          
          // Cerrar diálogo de carga
          await loadingSwal.close();
          
          // Mostrar mensaje de éxito
          await Swal.fire({
            title: 'Éxito',
            text: 'Asistencia guardada correctamente',
            icon: 'success'
          });
          
          // Resetear estado
          const initialAttendance = students.reduce((acc, student) => {
            acc[student.id] = 'P';
            return acc;
          }, {});
          setAttendance(initialAttendance);
          
        } catch (error) {
          console.error("Error al guardar la asistencia:", error);
          
          // Extraer mensaje de error del backend
          let errorMessage = 'Error al guardar la asistencia';
          
          // Manejar diferentes formatos de respuesta de error
          if (error.response) {
            // Respuesta del servidor con error
            if (error.response.data && error.response.data.message) {
              // Formato ErrorDto { message: "..." }
              errorMessage = error.response.data.message;
            } else if (typeof error.response.data === 'string') {
              // Respuesta de error como string
              errorMessage = error.response.data;
            }
          } else if (error.message) {
            // Error de red u otro tipo
            errorMessage = error.message;
          }
          
          await Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error'
          });
        } finally {
          setIsSaving(false);
        }
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
                    className={`px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isSaving}
                >
                    {isSaving && (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    )}
                    {isSaving ? 'Guardando...' : 'Guardar'}
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