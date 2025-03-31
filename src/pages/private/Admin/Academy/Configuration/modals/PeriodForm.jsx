// PeriodForm.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { configurationService } from "../";

const PeriodForm = ({ period, onClose, onSave, schoolYear }) => {
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    status: "A",
    setting_id: "",
    school_year: schoolYear
  });
  
  const [settings, setSettings] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(false);

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
        start_date: period.start_date ? new Date(period.start_date).toISOString().split('T')[0] : "",
        end_date: period.end_date ? new Date(period.end_date).toISOString().split('T')[0] : "",
        status: period.status || "A",
        setting_id: period.setting_id || "",
        school_year: schoolYear
      });
    } else {
      // Asegurar que school_year siempre esté actualizado en un nuevo periodo
      setFormData(prev => ({...prev, school_year: schoolYear}));
    }
  }, [period, schoolYear]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {period ? "Editar periodo académico" : "Nuevo periodo académico"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength="8"
                  placeholder="Ej: 2024-1P"
                />
                <p className="text-xs text-gray-500 mt-1">Máximo 8 caracteres</p>
              </div>

              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                </select>
              </div>

              <div>
                <label htmlFor="setting_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Esquema de calificación
                </label>
                {loadingSettings ? (
                  <div className="w-full py-2">Cargando esquemas...</div>
                ) : (
                  <select
                    id="setting_id"
                    name="setting_id"
                    value={formData.setting_id}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccione un esquema</option>
                    {settings.map(setting => (
                      <option key={setting.id} value={setting.id}>
                        {setting.name}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Seleccione el esquema de calificación para este periodo
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded mr-2 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PeriodForm;
