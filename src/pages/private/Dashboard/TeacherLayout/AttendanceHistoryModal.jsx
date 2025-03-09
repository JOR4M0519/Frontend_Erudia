import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Check, X as XIcon, Clock, Edit2, Save, Filter } from "lucide-react";
import { format, parseISO, isValid, isAfter, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { teacherDataService } from "../StudentLayout";
import { AttendanceStatus, AttendanceStatusLabels, AttendanceStatusColors, AttendanceProcessor } from "../../../../models";
import { XButton, CancelButton, BaseButton } from "../../../../components";
import { attendanceService } from "./attendanceService";

// Registrar el idioma español para el DatePicker
registerLocale("es", es);

export default function AttendanceHistoryModal({ isOpen, onClose, group, subject, period }) {
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [editedAttendance, setEditedAttendance] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);

  const DAYS_PER_PAGE = 7; // Número de días a mostrar por página

  // Cargar datos de asistencia cuando se abre el modal
  useEffect(() => {
    if (isOpen && group && subject && period) {
      fetchAttendanceData();
    }
  }, [isOpen, group, subject, period]);

  // Función para cargar los datos de asistencia
  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await attendanceService.getAttendanceHistoryForGroup(group, subject, period);
      const processedData = AttendanceProcessor.processAttendanceData(data);
      setAttendanceData(processedData);

      // Inicializar el estado de edición con los datos actuales
      const initialEditedState = {};
      processedData.students.forEach(student => {
        initialEditedState[student.id] = { ...processedData.attendanceMap[student.id] };
      });
      setEditedAttendance(initialEditedState);

      // Establecer fechas mínima y máxima para el filtro
      if (processedData.dates && processedData.dates.length > 0) {
        const parsedDates = processedData.dates
          .map(date => parseISO(date))
          .filter(date => isValid(date))
          .sort((a, b) => a.getTime() - b.getTime());

        if (parsedDates.length > 0) {
          setMinDate(parsedDates[0]);
          setMaxDate(parsedDates[parsedDates.length - 1]);
          // Resetear el filtro de fechas
          setDateRange([null, null]);
        }
      }

      // Resetear el modo de edición
      setIsEditMode(false);

    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("No se pudo cargar el historial de asistencia. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar fechas según el rango seleccionado
  const filteredDates = useMemo(() => {
    if (!attendanceData || !attendanceData.dates) return [];

    if (!startDate && !endDate) {
      return attendanceData.dates;
    }

    return attendanceData.dates.filter(dateStr => {
      const date = parseISO(dateStr);
      if (!isValid(date)) return false;

      const dayStart = startOfDay(date);

      if (startDate && endDate) {
        return !isBefore(dayStart, startOfDay(startDate)) && !isAfter(dayStart, startOfDay(endDate));
      } else if (startDate) {
        return !isBefore(dayStart, startOfDay(startDate));
      } else if (endDate) {
        return !isAfter(dayStart, startOfDay(endDate));
      }

      return true;
    });
  }, [attendanceData, startDate, endDate]);

  // Calcular las fechas que se muestran en la página actual
  const paginatedDates = useMemo(() => {
    if (!filteredDates || filteredDates.length === 0) return [];

    const startIdx = currentPage * DAYS_PER_PAGE;
    return filteredDates.slice(startIdx, startIdx + DAYS_PER_PAGE);
  }, [filteredDates, currentPage, DAYS_PER_PAGE]);

  // Calcular el número total de páginas
  const totalPages = useMemo(() => {
    if (!filteredDates || filteredDates.length === 0) return 0;
    return Math.ceil(filteredDates.length / DAYS_PER_PAGE);
  }, [filteredDates, DAYS_PER_PAGE]);

  // Función para cambiar el estado de asistencia de un estudiante en una fecha
  const toggleAttendanceStatus = (studentId, date) => {
    // Solo permitir cambios en modo de edición
    if (!isEditMode) return;

    const currentStatus = editedAttendance[studentId]?.[date] || AttendanceStatus.ABSENT;
    let newStatus;

    // Ciclo entre los estados: P -> A -> T -> P
    if (currentStatus === AttendanceStatus.PRESENT) {
      newStatus = AttendanceStatus.ABSENT;
    } else if (currentStatus === AttendanceStatus.ABSENT) {
      newStatus = AttendanceStatus.TARDY;
    } else {
      newStatus = AttendanceStatus.PRESENT;
    }

    setEditedAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [date]: newStatus
      }
    }));
  };

  // Función para guardar los cambios de asistencia
  const handleSaveAttendance = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Preparar los datos para enviar al servidor
      const attendanceRecords = [];

      attendanceData.students.forEach(student => {
        attendanceData.dates.forEach(date => {
          // Solo incluir registros que han cambiado
          const originalStatus = attendanceData.attendanceMap[student.id]?.[date];
          const newStatus = editedAttendance[student.id]?.[date];

          if (newStatus && newStatus !== originalStatus) {
            // Buscar el ID del horario para esta combinación de grupo y materia
            // Nota: Esto es una simplificación, puede que necesites ajustar según tu estructura de datos
            const scheduleId = 1; // Deberías obtener esto de tus datos

            attendanceRecords.push({
              studentId: student.id,
              scheduleId: scheduleId,
              attendanceDate: date,
              status: newStatus
            });
          }
        });
      });

      // Solo enviar si hay cambios
      if (attendanceRecords.length > 0) {
        await attendanceService.saveAttendanceRecords(attendanceRecords);
        // Recargar los datos para reflejar los cambios guardados
        await fetchAttendanceData();
      }

      // Mostrar mensaje de éxito
      alert("Registros de asistencia guardados correctamente");

      // Desactivar modo de edición
      setIsEditMode(false);

    } catch (err) {
      console.error("Error saving attendance:", err);
      setError("Error al guardar los cambios. Intente nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancelar cambios y volver al estado original
  const handleCancelEdit = () => {
    // Restaurar el estado original
    if (attendanceData) {
      const originalState = {};
      attendanceData.students.forEach(student => {
        originalState[student.id] = { ...attendanceData.attendanceMap[student.id] };
      });
      setEditedAttendance(originalState);
    }
    setIsEditMode(false);
  };

  // Renderizar el ícono según el estado de asistencia
  const renderAttendanceIcon = (status) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <Check className="w-4 h-4 text-green-600" />;
      case AttendanceStatus.ABSENT:
        return <XIcon className="w-4 h-4 text-red-600" />;
      case AttendanceStatus.TARDY:
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <span className="w-4 h-4 rounded-full border border-gray-300"></span>;
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd MMM", { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  // Función para aplicar el filtro de fechas
  const applyDateFilter = () => {
    setCurrentPage(0); // Volver a la primera página al aplicar el filtro
    setShowDateFilter(false);
  };

  // Función para limpiar el filtro de fechas
  const clearDateFilter = () => {
    setDateRange([null, null]);
    setCurrentPage(0);
    setShowDateFilter(false);
  };

  if (!isOpen) return null;

  return (
    <section className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <article className="bg-white rounded-xl w-full max-w-6xl shadow-lg max-h-[90vh] flex flex-col">
        <header className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Historial de Asistencia</h2>
          <nav className="flex items-center space-x-2">
            {!isLoading && attendanceData && (
              <>
                <BaseButton
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Filter className="w-5 h-5" title="Filtrar por fecha" />
                </BaseButton>

                {!isEditMode ? (
                  <BaseButton
                    onClick={() => setIsEditMode(true)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Edit2 className="w-5 h-5" title="Editar asistencia" />
                  </BaseButton>
                ) : (
                  <BaseButton
                    onClick={handleSaveAttendance}
                    className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${isSaving ? 'opacity-50' : ''}`}
                    disabled={isSaving}
                  >
                    <Save className="w-5 h-5 text-blue-600" title="Guardar cambios" />
                  </BaseButton>
                )}
              </>
            )}
            <XButton onClick={onClose} confirmExit={isEditMode} />
          </nav>
        </header>

        {/* Filtro de fechas */}
        {/* Filtro de fechas */}
        {showDateFilter && (
          <section className="p-4 bg-gray-50 border-b">
            <form className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" onSubmit={(e) => { e.preventDefault(); applyDateFilter(); }}>
              <fieldset className="relative">
                <legend className="block text-sm font-medium text-gray-700 mb-1">Rango de fechas:</legend>
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  minDate={minDate}
                  maxDate={maxDate}
                  dateFormat="dd/MM/yyyy"
                  locale="es"
                  isClearable={true}
                  placeholderText="Seleccionar rango de fechas"
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  popperClassName="z-50" // Agregar una clase z-index alta
                  popperPlacement="bottom" // Posición simple
                />
              </fieldset>
              <div className="flex space-x-2 w-full sm:w-auto">
                <BaseButton
                  onClick={applyDateFilter}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Aplicar filtro
                </BaseButton>
                <BaseButton
                  onClick={clearDateFilter}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Limpiar
                </BaseButton>
              </div>
            </form>
          </section>
        )}


        <main className="flex-1 flex flex-col">
          {isLoading ? (
            <section className="flex-1 flex items-center justify-center p-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Cargando historial...</span>
            </section>
          ) : error ? (
            <section className="flex-1 flex items-center justify-center p-8">
              <div className="text-red-500 text-center">
                <p>{error}</p>
                <BaseButton
                  onClick={fetchAttendanceData}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Reintentar
                </BaseButton>
              </div>
            </section>
          ) : attendanceData && attendanceData.students.length > 0 ? (
            <>
              {/* Controles de paginación */}
              <nav className="flex items-center justify-between px-6 py-3 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Mostrando {paginatedDates.length} de {filteredDates.length} días
                  {startDate && endDate && (
                    <span className="ml-2">
                      ({format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")})
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <BaseButton
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className={`p-1 rounded-full ${currentPage === 0 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-200'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </BaseButton>
                  <span className="text-sm font-medium">
                    Página {currentPage + 1} de {totalPages || 1}
                  </span>
                  <BaseButton
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className={`p-1 rounded-full ${currentPage >= totalPages - 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-200'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </BaseButton>
                </div>

                {/* Leyenda de estados */}
                <aside className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-xs">Presente</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                    <span className="text-xs">Ausente</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                    <span className="text-xs">Tarde</span>
                  </div>
                </aside>
              </nav>

              {/* Tabla de asistencia */}
              <section className="flex-1 overflow-auto">
                {paginatedDates.length > 0 ? (
                  <table className="min-w-max w-full">
                    {/* Encabezado con fechas */}
                    <thead className="sticky top-0 bg-white z-0 shadow-sm">
                      <tr className="grid grid-cols-[300px_repeat(auto-fill,60px)] border-b">
                        <th className="font-medium p-3 bg-gray-50 border-r text-left">Estudiante</th>
                        {paginatedDates.map((date) => (
                          <th key={date} className="text-center font-medium p-2 text-sm bg-gray-50">
                            <time dateTime={date}>{formatDate(date)}</time>
                          </th>
                        ))}
                      </tr>
                    </thead>


                    {/* Filas de estudiantes */}
                    <tbody className="divide-y">
                      {attendanceData.students.map((student) => {
                        // Calcular estadísticas para este estudiante
                        const stats = AttendanceProcessor.calculateStudentStats(
                          student.id,
                          editedAttendance,
                          filteredDates
                        );

                        return (
                          <tr key={student.id} className="grid grid-cols-[300px_repeat(auto-fill,60px)] hover:bg-gray-50">
                            <td className="p-3 flex flex-col justify-center border-r">
                              <div className="font-medium text-sm">
                                {student.lastName}, {student.firstName}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Asistencia: {stats.percentage}% ({stats.present}/{stats.total})
                              </div>
                            </td>

                            {paginatedDates.map((date) => {
                              const status = editedAttendance[student.id]?.[date];

                              return (
                                <td
                                  key={`${student.id}-${date}`}
                                  className={`flex justify-center items-center ${isEditMode ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                  onClick={() => toggleAttendanceStatus(student.id, date)}
                                >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status ? AttendanceStatusColors[status] : 'bg-gray-100'} ${isEditMode ? 'transition-all hover:scale-110' : ''}`}>
                                    {renderAttendanceIcon(status)}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="flex-1 flex items-center justify-center p-8 text-gray-500">
                    No hay datos de asistencia disponibles para el rango de fechas seleccionado.
                  </p>
                )}
              </section>
            </>
          ) : (
            <p className="flex-1 flex items-center justify-center p-8 text-gray-500">
              No hay datos de asistencia disponibles.
            </p>
          )}
        </main>

        <footer className="p-6 border-t flex justify-end space-x-3">
          {isEditMode ? (
            <>
              <CancelButton onClick={handleCancelEdit} confirmExit={true} />
              <BaseButton
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center ${isSaving ? 'opacity-70' : ''}`}
              >
                {isSaving && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                )}
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </BaseButton>
            </>
          ) : (
            <CancelButton onClick={onClose} text="Cerrar" />
          )}
        </footer>
      </article>
    </section>
  );
}
