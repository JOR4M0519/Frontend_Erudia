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
      result = result.filter(period => period.setting && period.setting.id === parseInt(settingFilter));
    }
    
    setFilteredPeriods(result);
  };

  const resetFilters = () => {
    setStartDateFilter(null);
    setEndDateFilter(null);
    setStatusFilter("");
    setSettingFilter("");
  };

  const handleCreatePeriod = async (periodData) => {
    try {
      // Verificar si hay solapamiento de fechas
      if (!isDateRangeValid(periodData.startDate, periodData.endDate, null)) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El rango de fechas se solapa con un período existente'
        });
        return false;
      }

      await configurationService.createPeriod(periodData);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Período creado correctamente'
      });
      fetchPeriods();
      return true;
    } catch (error) {
      console.error("Error al crear período:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el período'
      });
      return false;
    }
  };

  const handleUpdatePeriod = async (periodId, periodData) => {
    try {
      // Verificar si hay solapamiento de fechas (excluyendo el periodo actual)
      if (!isDateRangeValid(periodData.startDate, periodData.endDate, periodId)) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El rango de fechas se solapa con un período existente'
        });
        return false;
      }

      await configurationService.updatePeriod(periodId, periodData);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Período actualizado correctamente'
      });
      fetchPeriods();
      return true;
    } catch (error) {
      console.error("Error al actualizar período:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el período'
      });
      return false;
    }
  };

  // Función para validar que el rango de fechas no se solape con otros periodos
  const isDateRangeValid = (startDate, endDate, currentPeriodId) => {
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);
    
    // Verificar que la fecha de inicio sea anterior a la fecha de fin
    if (newStartDate > newEndDate) {
      return false;
    }
    
    // Verificar solapamiento con otros periodos
    return !periods.some(period => {
      // Si estamos editando, excluir el periodo actual de la comparación
      if (currentPeriodId && period.id === currentPeriodId) {
        return false;
      }
      
      const periodStartDate = new Date(period.startDate);
      const periodEndDate = new Date(period.endDate);
      
      // Comprobar si hay solapamiento
      // (newStart <= periodEnd) && (newEnd >= periodStart)
      return (
        newStartDate <= periodEndDate && 
        newEndDate >= periodStartDate
      );
    });
  };

  const handleDeletePeriod = async (periodId) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede revertir",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
      
      if (result.isConfirmed) {
        await configurationService.deletePeriod(periodId);
        Swal.fire(
          '¡Eliminado!',
          'El período ha sido eliminado.',
          'success'
        );
        fetchPeriods();
      }
    } catch (error) {
      console.error("Error al eliminar período:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el período'
      });
    }
  };

  const openCreateModal = () => {
    setSelectedPeriod(null);
    setShowModal(true);
  };

  const openEditModal = (period) => {
    setSelectedPeriod(period);
    setShowModal(true);
  };

  const handleSavePeriod = async (periodData) => {
    let success = false;
    
    if (selectedPeriod) {
      // Actualizar periodo existente
      success = await handleUpdatePeriod(selectedPeriod.id, periodData);
    } else {
      // Crear nuevo periodo
      success = await handleCreatePeriod(periodData);
    }
    
    if (success) {
      setShowModal(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      {/* Filtros y acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-4 md:mb-0">
          <label className="mr-2 font-medium">Año escolar:</label>
          <select
            value={schoolYear}
            onChange={(e) => setSchoolYear(parseInt(e.target.value))}
            className="form-select rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            {[schoolYear - 1, schoolYear, schoolYear + 1].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="ml-4 flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </button>
        </div>
        
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Crear período
        </button>
      </div>
      
      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filtros avanzados</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio desde</label>
              <DatePicker
                selected={startDateFilter}
                onChange={date => setStartDateFilter(date)}
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccionar fecha"
                isClearable
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin hasta</label>
              <DatePicker
                selected={endDateFilter}
                onChange={date => setEndDateFilter(date)}
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccionar fecha"
                isClearable
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="">Todos</option>
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Configuración</label>
              <select
                value={settingFilter}
                onChange={(e) => setSettingFilter(e.target.value)}
                className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="">Todas</option>
                {Object.values(gradeSettings).map(setting => (
                  <option key={setting.id} value={setting.id}>{setting.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
      
      {/* Tabla de períodos */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha inicio</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha fin</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentaje</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Configuración</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                      Cargando períodos...
                    </div>
                  </td>
                </tr>
              ) : filteredPeriods.length > 0 ? (
                filteredPeriods.map((period) => (
                  <tr key={period.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(period.startDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(period.endDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.percentage}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        period.status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {period.status === 'A' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    
                      {period.gradeSetting?.name || 'No asignada'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(period)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePeriod(period.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron períodos con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de creación/edición */}
      {showModal && (
        <PeriodForm
          period={selectedPeriod}
          onClose={() => setShowModal(false)}
          onSave={handleSavePeriod}
          schoolYear={schoolYear}
        />
      )}
    </div>
  );
};

export default PeriodsTab;

