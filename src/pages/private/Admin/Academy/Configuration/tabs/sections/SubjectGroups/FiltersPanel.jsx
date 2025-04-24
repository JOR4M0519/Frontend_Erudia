import React from "react";
import { Search, RefreshCw } from "lucide-react";

const FiltersPanel = ({
  subjectSearchTerm,
  setSubjectSearchTerm,
  groupFilter,
  setGroupFilter,
  periodFilter,
  setPeriodFilter,
  professorFilter,
  setProfessorFilter,
  statusFilter,
  setStatusFilter,
  levelFilter,
  setLevelFilter,
  groupByType,
  setGroupByType,
  showSubjectsPanel,
  setShowSubjectsPanel,
  resetFilters,
  allGroups,
  allProfessors,
  levels,
  periods,
  getProfessorFullName
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Filtros</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setGroupByType(groupByType === "group" ? "subject" : "group")}
            className="px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700"
          >
            {groupByType === "group" ? "Agrupar por materias" : "Agrupar por grupos"}
          </button>
          <button
            onClick={() => setShowSubjectsPanel(!showSubjectsPanel)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              showSubjectsPanel 
                ? 'bg-gray-200 text-gray-700' 
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {showSubjectsPanel ? 'Ocultar panel' : 'Mostrar panel'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filtro de búsqueda por materia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar materia
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={subjectSearchTerm}
              onChange={(e) => setSubjectSearchTerm(e.target.value)}
              placeholder="Nombre de la materia..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Filtro por grupo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grupo
          </label>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los grupos</option>
            {allGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.groupName} ({group.groupCode})
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtro por nivel educativo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel educativo
          </label>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los niveles</option>
            {levels && levels.map(level => (
              <option key={level.id} value={level.id}>
                {level.levelName}
              </option>
            ))}
          </select>
        </div>
        
        {/* Resto de filtros... */}
        {/* Filtro por periodo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Periodo académico
          </label>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los periodos</option>
            {periods.map(period => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtro por profesor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profesor
          </label>
          <select
            value={professorFilter}
            onChange={(e) => setProfessorFilter(e.target.value)}
            className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los profesores</option>
            {allProfessors.map(professor => (
              <option key={professor.id} value={professor.id}>
                {getProfessorFullName(professor)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtro por estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="A">Activo</option>
            <option value="I">Inactivo</option>
          </select>
        </div>
        
        {/* Botón de reseteo */}
        <div className="flex items-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
          >
            <RefreshCw size={16} className="mr-1" />
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel;
