// LevelForm.jsx
import React, { useState, useEffect } from "react";

const LevelForm = ({ level, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    level_name: "",
    status: "A"
  });

  useEffect(() => {
    if (level) {
      setFormData({
        level_name: level.level_name || "",
        status: level.status || "A"
      });
    } else {
      // Reset form cuando se está creando un nuevo nivel
      setFormData({
        level_name: "",
        status: "A"
      });
    }
  }, [level]);

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
    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="level_name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="level_name"
              name="level_name"
              value={formData.level_name}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
              placeholder="Ingrese el nombre del nivel académico"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <div className="relative inline-block w-auto">
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="appearance-none bg-white border rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="mr-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
          >
            Aceptar
          </button>
        </div>
      </form>
    </div>
  );
};

export default LevelForm;
