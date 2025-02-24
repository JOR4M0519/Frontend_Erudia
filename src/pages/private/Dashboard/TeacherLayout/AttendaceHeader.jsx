import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDays, Book } from "lucide-react";
import { useSelector } from "react-redux";

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

export default function AttendanceHeader({ selectedDate, setSelectedDate, subject }) {
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

  return (
    <div className="bg-gray-200 p-4 rounded-xl flex justify-between items-center relative">
      {/* 🔹 Materia actual con su código */}
      <div className="flex flex-col text-gray-700 font-medium">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5" />
          <span>{subject?.subjectName || "Materia no especificada"}</span>
        </div>
        <span className="text-sm text-gray-600">
          {subject?.group?.groupName ? `Grupo: ${subject.group.groupName}` : "Grupo no especificado"}
        </span>
      </div>

      {/* 🔹 Selector de fecha con react-datepicker */}
      <div className="relative">
        <DatePicker disabled
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)} // 🔹 Permite seleccionar cualquier fecha dentro del rango
          //highlightDates={allowedDates} // 🔹 (Activar en el futuro)
          dateFormat="dd/MM/yyyy"
          minDate={new Date(new Date().setMonth(new Date().getMonth() - 6))} // 🔹 Máximo 6 meses atrás
          maxDate={new Date(reduxSelectedDate)} // 🔹 No permite elegir días en el futuro
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400 transition cursor-pointer"
        />
        
        {/* Esta función permite filtrar las fechas disponibles
         <DatePicker 
          selected={selectedDate}
          onChange={(date) => isDateAllowed(date) && setSelectedDate(date)}
          highlightDates={allowedDates}
          dateFormat="dd/MM/yyyy"
          minDate={new Date(new Date().setMonth(new Date().getMonth() - 6))} // 🔹 Máximo 6 meses atrás
          maxDate={new Date()} // 🔹 No permite elegir días en el futuro
          filterDate={isDateAllowed} // 🔹 Solo permite seleccionar los días habilitados
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400 transition cursor-pointer"
        /> */}
        <CalendarDays className="absolute right-2 top-2 w-5 h-5 text-gray-500" />
      </div>

      <span className="text-lg font-medium">Asistencia</span>
    </div>
  );
}
