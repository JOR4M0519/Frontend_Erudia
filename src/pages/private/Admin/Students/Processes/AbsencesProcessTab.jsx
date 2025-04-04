import React, { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

const AbsencesProcessTab = ({ year }) => {
  const [dateRange, setDateRange] = useState({
    start: "2025-03-03",
    end: "2025-03-03",
  });

  const [selectedFilters, setSelectedFilters] = useState({
    course: "Segundo B",
    status: "Activo",
  });

  const [absenceType, setAbsenceType] = useState("Justificada");
  const [observation, setObservation] = useState("");

  return (
    <div>
      {/* Rango de fechas */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Rango de fechas</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <label htmlFor="startDate" className="mr-2 text-sm text-gray-600">Fecha inicial:</label>
            <input 
              type="date" 
              id="startDate"
              className="border border-gray-300 rounded px-3 py-1.5"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <div className="flex items-center">
            <span className="mx-2 text-gray-600">a</span>
            <label htmlFor="endDate" className="mr-2 text-sm text-gray-600">Fecha final:</label>
            <input 
              type="date" 
              id="endDate"
              className="border border-gray-300 rounded px-3 py-1.5"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Filtro de estudiantes */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filtro de estudiantes</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8"
                value={selectedFilters.course}
                onChange={(e) => setSelectedFilters({...selectedFilters, course: e.target.value})}
              >
                <option value="Segundo B">Segundo B</option>
                <option value="Segundo A">Segundo A</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
            <button className="ml-2 p-1.5 bg-white border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8"
                value={selectedFilters.status}
                onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
            <button className="ml-2 p-1.5 bg-white border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tipo de ausencia */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo</h3>
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-2"
            value={absenceType}
            onChange={(e) => setAbsenceType(e.target.value)}
          >
            <option value="Justificada">Justificada</option>
            <option value="No justificada">No justificada</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Observación */}
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Observación" 
          className="w-full border border-gray-300 rounded-lg py-3 px-4"
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors">
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default AbsencesProcessTab;
