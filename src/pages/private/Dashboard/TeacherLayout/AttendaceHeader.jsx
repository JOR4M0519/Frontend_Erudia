import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDays } from "lucide-react";
import { useSelector } from "react-redux";
import SubjectHeader from "../../Subject/SubjectHeader";

// 🔹 Simulación de Fetch API: Días habilitados del mes (Temporalmente no se usa)
const fetchAllowedDates = async () => {
  return [
    new Date("2025-02-02"),
    new Date("2025-02-05"),
    new Date("2025-02-10"),
    new Date("2025-02-12"),
    new Date("2025-02-15"),
    new Date("2025-02-18"),
    new Date("2025-02-20"),
    new Date("2025-02-25"),
    new Date("2025-02-27")
  ];
};

const AttendanceHeader = ({ selectedDate, setSelectedDate, subject }) => {
  const [allowedDates, setAllowedDates] = useState([]); // 🔹 Guardará los días permitidos
  const reduxSelectedDate = useSelector((state) => state.date.selectedDate);

  // 🔹 Obtener fechas permitidas desde API (Temporalmente no se usa)
  useEffect(() => {
    const getAllowedDates = async () => {
      const dates = await fetchAllowedDates();
      setAllowedDates(dates);
    };
    getAllowedDates();
  }, []);

  // 🔹 Verifica si la fecha está permitida (Temporalmente sin efecto)
  const isDateAllowed = (date) => allowedDates.some((allowedDate) => allowedDate.toDateString() === date.toDateString());

  // Componente de selección de fecha personalizado
  const DateSelector = () => (
    <div className="flex items-center gap-3">
      <DatePicker
        disabled
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="dd/MM/yyyy"
        minDate={new Date(new Date().setMonth(new Date().getMonth() - 6))}
        maxDate={new Date(reduxSelectedDate)}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400 transition cursor-pointer"
      />
      <CalendarDays className="w-5 h-5 text-gray-500" />
    </div>
  );

  // Función personalizada para renderizar acciones adicionales en el SubjectHeader
  const renderCustomActions = () => (
    <div className="flex items-center space-x-3">
      <DateSelector />
      <div className="bg-green-50 border border-green-200 text-green-600 font-medium rounded-lg px-4 py-2">
        <span>Asistencia</span>
      </div>
    </div>
  );

  return (
    <SubjectHeader
      subjectName={subject?.subjectName || "Materia no especificada"}
      groupInfo={subject?.group ? {
        groupName: subject.group.groupName || "Grupo no especificado",
        groupCode: "",
        level: null
      } : null}
      isTeacher={true}
      periodGrade={null}
      activities={[]}
      // En lugar de usar los botones predeterminados, renderizamos nuestro contenido personalizado
      customActionContent={renderCustomActions()}
    />
  );
}

export default AttendanceHeader;