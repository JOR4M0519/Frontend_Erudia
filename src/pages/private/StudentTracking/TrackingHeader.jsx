import React, { useState, useEffect } from "react";
import { BookOpen, Users, Search, Calendar, Plus, AlertCircle } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

// Registramos el locale español
registerLocale("es", es);

export default function TrackingHeader({
  isTeacher,
  userState,
  searchTerm,
  onSearchChange,
  onDateFilter,
  onCreateObservation,
  minDate,
  maxDate
}) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateError, setDateError] = useState("");
  
// Corregir el procesamiento de fechas para evitar desplazamientos por zona horaria
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Dividir la fecha en año, mes y día
  const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
  
  // Crear una nueva fecha usando UTC para evitar ajustes por zona horaria
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
};

// Convertir las fechas mínimas y máximas recibidas como props a objetos Date
const minObservationDate = parseDate(minDate);
const maxObservationDate = parseDate(maxDate) || new Date();
  

  // Efecto para filtrar fechas que no causa bucle infinito
  useEffect(() => {
    // Solo ejecutar la acción si ambas fechas están presentes
    if (startDate && endDate) {
      if (startDate > endDate) {
        setDateError("La fecha inicial no puede ser posterior a la fecha final");
      } else {
        setDateError("");
        // Solo notificar al componente padre cuando cambian las fechas y son válidas
        onDateFilter({ 
          startDate: startDate.toISOString().split("T")[0], 
          endDate: endDate.toISOString().split("T")[0] 
        });
      }
    } else if (startDate && !endDate) {
      setDateError("");
      onDateFilter({ startDate: startDate.toISOString().split("T")[0] });
    } else if (!startDate && endDate) {
      setDateError("");
      onDateFilter({ endDate: endDate.toISOString().split("T")[0] });
    } else {
      // Ambas fechas son null, resetear filtros
      onDateFilter({});
    }
  }, [startDate, endDate]); // Solo dependemos de startDate y endDate

  const handleChangeDate = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };
  
  // Función para limpiar las fechas y resetear los filtros
  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    // Explícitamente llamamos a onDateFilter con un objeto vacío para resetear los filtros
    onDateFilter({});
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 transition-all hover:shadow-xl border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Información principal */}
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">
              {isTeacher ? "Seguimiento de Estudiantes" : "Observaciones del Estudiante"}
            </h2>
            {isTeacher && (
              <div className="flex items-center mt-2 bg-indigo-50 px-3 py-1 rounded-lg w-fit">
                <Users className="w-4 h-4 text-indigo-600 mr-2" />
                <span className="text-sm text-indigo-700 font-medium">
                  {userState.groupName || "Todos los grupos"}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Filtros y acciones */}
        <div className="flex flex-col w-full md:w-auto gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder={isTeacher ? "Buscar estudiante..." : "Buscar observación..."}
              value={searchTerm}
              onChange={onSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full">
              <div className="relative">
              <div className="w-full relative">
                  <Calendar className="w-5 h-5 text-blue-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none" />
                  <DatePicker
                    selected={startDate}
                    onChange={handleChangeDate}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Seleccionar rango de fechas"
                    minDate={minObservationDate}
                    maxDate={maxObservationDate}
                    className={`pl-10 pr-4 py-2 border ${dateError ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all`}
                    customInput={
                      <input
                        className={`pl-10 pr-4 py-2 border ${dateError ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all`}
                      />
                    }
                  />
                </div>
                {dateError && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>{dateError}</span>
                  </div>
                )}
                {(startDate || endDate) && (
                  <button
                    onClick={clearDates}
                    className="text-xs text-gray-500 underline hover:text-blue-500 mt-1 ml-2"
                  >
                    Limpiar fechas
                  </button>
                )}
              </div>
            </div>
            
            {isTeacher && (
              <button
                onClick={onCreateObservation}
                className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 font-medium rounded-lg px-4 py-2 hover:bg-blue-100 transition whitespace-nowrap mt-2 sm:mt-0 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Crear observación</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}