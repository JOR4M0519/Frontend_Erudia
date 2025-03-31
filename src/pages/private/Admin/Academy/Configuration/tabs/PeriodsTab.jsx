// PeriodsTab.jsx
import React, { useState, useEffect } from "react";
import { configurationService, PeriodForm } from "../";
import { Plus, Edit, Trash2, Settings, Filter, X } from "lucide-react";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker"; // Asegúrate de tener esta dependencia
import "react-datepicker/dist/react-datepicker.css";

const PeriodsTab = () => {
  const [periods, setPeriods] = useState([]);
  const [filteredPeriods, setFilteredPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolYear, setSchoolYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [gradeSettings, setGradeSettings] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Estados para los filtros
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [settingFilter, setSettingFilter] = useState("");

  useEffect(() => {
    fetchPeriods();
    fetchGradeSettings();
  }, [schoolYear]);

  useEffect(() => {
    applyFilters();
  }, [periods, startDateFilter, endDateFilter, statusFilter, settingFilter]);

  const fetchGradeSettings = async () => {
    try {
      const settings = await configurationService.getGradeSettings();
      const settingsMap = {};
      settings.forEach(setting => {
        settingsMap[setting.id] = setting;
      });
      setGradeSettings(settingsMap);
    } catch (error) {
      console.error("Error al cargar configuraciones de calificación:", error);
    }
  };

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const data = await configurationService.getPeriodsByYear(schoolYear);
      setPeriods(data);
      setFilteredPeriods(data);
    } catch (error) {
      console.error("Error al obtener períodos:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los períodos'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...periods];
    
    // Filtro por rango de fechas
    if (startDateFilter) {
      const startDate = new Date(startDateFilter);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(period => {
        const periodStartDate = new Date(period.startDate);
        periodStartDate.setHours(0, 0, 0, 0);
        return periodStartDate >= startDate;
      });
    }
    
    if (endDateFilter) {
      const endDate = new Date(endDateFilter);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(period => {
        const periodEndDate = new Date(period.endDate);
        periodEndDate.setHours(0, 0, 0, 0);
        return periodEndDate <= endDate;
      });
    }
    
    // Filtro por estado
    if (statusFilter) {
      result = result.filter(period => period.status === statusFilter);
    }
    
    // Filtro por configuración
    if (settingFilter) {
      result = result.filter(period => period.gradeSetting?.id === parseInt(settingFilter));
    }
    
    setFilteredPeriods(result);
  };
  

  const resetFilters = () => {
    setStartDateFilter(null);
    setEndDateFilter(null);
    setStatusFilter("");
    setSettingFilter("");
  };

  const handleOpenModal = (period = null) => {
    setSelectedPeriod(period);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPeriod(null);
    setShowModal(false);
  };

  const handleSavePeriod = async (periodData) => {
    try {
      if (selectedPeriod) {
        await configurationService.updatePeriod(selectedPeriod.id, periodData);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Periodo académico actualizado correctamente',
          timer: 1500
        });
      } else {
        await configurationService.createPeriod(periodData);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Periodo académico creado correctamente',
          timer: 1500
        });
      }
      fetchPeriods();
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar periodo:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el periodo académico'
      });
    }
  };

  const handleDeletePeriod = async (periodId, periodName) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el período "${periodName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await configurationService.deletePeriod(periodId);
          fetchPeriods();
          Swal.fire(
            '¡Eliminado!',
            'El período ha sido eliminado.',
            'success'
          );
        } catch (error) {
          console.error("Error al eliminar período:", error);
          Swal.fire(
            'Error',
            'No se pudo eliminar el período',
            'error'
          );
        }
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Obtener lista única de configuraciones para el filtro
  const uniqueSettings = Object.values(gradeSettings);

  return (
    <div className="w-full px-4 py-4">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">Año escolar</h2>
            <div className="relative inline-block">
              <select
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="appearance-none bg-gray-100 border border-gray-300 rounded-md px-3 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - 2 + i}>
                    {new Date().getFullYear() - 2 + i}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-4">
              Total: {loading ? "..." : filteredPeriods.length} de {periods.length} períodos
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
            >
              <Filter size={18} />
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </button>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
            >
              <Plus size={18} />
              Crear período
            </button>
          </div>
        </div>

        {/* Sección de filtros */}
        {/* Sección de filtros */}
{showFilters && (
  <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Rango de fechas</label>
        <DatePicker
          selectsRange
          startDate={startDateFilter}
          endDate={endDateFilter}
          onChange={(dates) => {
            const [start, end] = dates;
            setStartDateFilter(start);
            setEndDateFilter(end);
          }}
          dateFormat="dd/MM/yyyy"
          className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholderText="Seleccionar rango de fechas"
          isClearable
          minDate={new Date(schoolYear, 0, 1)}
          maxDate={new Date(schoolYear, 11, 31)}
        />
      </div>
      
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Estado</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </select>
      </div>
      
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Esquema</label>
        <select
          value={settingFilter}
          onChange={(e) => setSettingFilter(e.target.value)}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {uniqueSettings.map(setting => (
            <option key={setting.id} value={setting.id}>
              {setting.name}
            </option>
          ))}
        </select>
      </div>
      
      <button 
        onClick={resetFilters}
        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded transition-colors"
      >
        <X size={16} />
        Limpiar filtros
      </button>
    </div>
  </div>
)}

      </div>

      {/* Tabla de períodos */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha inicio</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha fin</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Esquema</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <p className="mt-2 text-gray-500">Cargando períodos...</p>
                </td>
              </tr>
            ) : filteredPeriods.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  <p className="text-gray-500">No hay períodos que coincidan con los filtros aplicados.</p>
                </td>
              </tr>
            ) : (
              filteredPeriods.map((period) => (
                <tr key={period.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(period.startDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(period.endDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {period.status === 'A' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {period.gradeSetting?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleOpenModal(period)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md px-3 py-1.5 transition-colors"
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePeriod(period.id, period.name)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-md px-3 py-1.5 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar periodo */}
      {showModal && (
        <PeriodForm
          period={selectedPeriod}
          onClose={handleCloseModal}
          onSave={handleSavePeriod}
          schoolYear={schoolYear}
        />
      )}
    </div>
  );
};

export default PeriodsTab;
