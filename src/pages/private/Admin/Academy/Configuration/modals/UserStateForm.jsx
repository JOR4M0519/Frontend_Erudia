// UserStateForm.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const UserStateForm = ({ state, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: ""
  });

  useEffect(() => {
    if (state) {
      setFormData({
        name: state.name || ""
      });
    } else {
      // Reset form cuando se está creando un nuevo estado
      setFormData({
        name: ""
      });
    }
  }, [state]);

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-amber-50 rounded-lg p-4 border border-amber-200 shadow-md"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200"
              required
              placeholder="Ingrese el nombre del estado"
              autoFocus
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onCancel}
            className="mr-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-all duration-300"
          >
            Cancelar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-6 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-all duration-300 shadow-sm"
          >
            Aceptar
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default UserStateForm;
