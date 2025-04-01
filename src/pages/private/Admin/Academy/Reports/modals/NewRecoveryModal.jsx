import { useState, useEffect } from "react";

const NewRecoveryModal = ({ isOpen, onClose, subject, periods, students, selectedPeriod, onSave }) => {
  const [form, setForm] = useState({
    idStudent: "",
    idSubject: "",
    idPeriod: "",
    newScore: ""
  });

  useEffect(() => {
    if (subject && selectedPeriod) {
      setForm(prev => ({
        ...prev,
        idSubject: subject.id || "",
        idPeriod: selectedPeriod || ""
      }));
    }
  }, [subject, selectedPeriod]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validar que los campos no estén vacíos
    if (!form.idStudent || !form.newScore) {
      alert("Por favor complete todos los campos requeridos");
      return;
    }
    
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Registrar nueva recuperación</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estudiante
          </label>
          <select
            name="idStudent"
            value={form.idStudent}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Seleccione un estudiante</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Materia
          </label>
          <input
            type="text"
            value={subject?.name || ""}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Periodo
          </label>
          <select
            value={form.idPeriod}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          >
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva calificación
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="5"
            name="newScore"
            value={form.newScore}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewRecoveryModal;
