// PeriodForm.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { configurationService } from "../";
import DatePicker from "react-datepicker";

const PeriodForm = ({ period, onClose, onSave, schoolYear }) => {
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    status: "A",
    setting_id: "",
    percentage: 0,
    school_year: schoolYear
  });
  
  const [settings, setSettings] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar configuraciones de calificación al montar el componente
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoadingSettings(true);
        const data = await configurationService.getGradeSettings();
        setSettings(data);
        
        // Si hay settings y no hay uno seleccionado, seleccionar el primero por defecto
        if (data.length > 0 && !formData.setting_id) {
          setFormData(prev => ({...prev, setting_id: data[0].id}));
        }
      } catch (error) {
        console.error("Error al cargar configuraciones de calificación:", error);
      } finally {
        setLoadingSettings(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Si se está editando un periodo existente, cargar sus datos
  useEffect(() => {
    if (period) {
      setFormData({
        name: period.name || "",
        start_date: period.startDate ? new Date(period.startDate) : "",
        end_date: period.endDate ? new Date(period.endDate) : "",
        status: period.status || "A",
        setting_id: period.setting ? period.setting.id : "",
        percentage: period.percentage || 0,
        school_year: schoolYear
      });
    } else {
      // Para nuevo periodo, asegurarse de que tenga el año escolar actual
      setFormData(prev => ({
        ...prev,
        school_year: schoolYear
      }));
    }
  }, [period, schoolYear]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "percentage" ? parseFloat(value) || 0 : value
    }));
    
    // Limpiar error del campo cuando cambia
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    
    // Limpiar error del campo cuando cambia
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    
    if (!formData.start_date) {
      newErrors.start_date = "La fecha de inicio es obligatoria";
    }
    
    if (!formData.end_date) {
      newErrors.end_date = "La fecha de fin es obligatoria";
    } else if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
    }
    
    if (!formData.setting_id) {
      newErrors.setting_id = "La configuración de calificación es obligatoria";
    }
    
    if (formData.percentage < 0 || formData.percentage > 100) {
      newErrors.percentage = "El porcentaje debe estar entre 0 y 100";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Formatear los datos según el formato esperado por el backend (AcademicPeriodDomain)
      const periodDomain = {
        startDate: formData.start_date instanceof Date 
          ? formData.start_date.toISOString().split('T')[0] 
          : formData.start_date,
        endDate: formData.end_date instanceof Date 
          ? formData.end_date.toISOString().split('T')[0] 
          : formData.end_date,
        name: formData.name,
        status: formData.status,
        percentage: formData.percentage,
        gradeSetting: { id: formData.setting_id },
        schoolYear: formData.school_year
      };
      
      // Si estamos editando, incluir el ID
      if (period && period.id) {
        periodDomain.id = period.id;
      }
      
      await onSave(periodDomain);
    } catch (error) {
      console.error("Error al guardar el período:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {period ? "Editar período" : "Crear nuevo período"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del período *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ej. Primer trimestre"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio *
              </label>
              <DatePicker
                selected={formData.start_date}
                onChange={(date) => handleDateChange(date, "start_date")}
                dateFormat="dd/MM/yyyy"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.start_date ? "border-red-500" : "border-gray-300"
                }`}
                placeholderText="Seleccionar fecha"
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de fin *
              </label>
              <DatePicker
                selected={formData.end_date}
                onChange={(date) => handleDateChange(date, "end_date")}
                dateFormat="dd/MM/yyyy"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.end_date ? "border-red-500" : "border-gray-300"
                }`}
                placeholderText="Seleccionar fecha"
                minDate={formData.start_date}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje (%) *
              </label>
              <input
                type="number"
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.percentage ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.percentage && (
                <p className="mt-1 text-sm text-red-600">{errors.percentage}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Configuración de calificación *
            </label>
            {loadingSettings ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : (
              <select
                name="setting_id"
                value={formData.setting_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.setting_id ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Seleccionar configuración</option>
                {settings.map(setting => (
                  <option key={setting.id} value={setting.id}>
                    {setting.name}
                  </option>
                ))}
              </select>
            )}
            {errors.setting_id && (
              <p className="mt-1 text-sm text-red-600">{errors.setting_id}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PeriodForm;
