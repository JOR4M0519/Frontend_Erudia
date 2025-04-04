import { useState, useEffect } from "react";

const EditRecoveryModal = ({ isOpen, onClose, student, onSave }) => {
  const [form, setForm] = useState({
    totalScore: "",
    recovered: "N"
  });

  useEffect(() => {
    if (student) {
      setForm({
        totalScore: student.subjectGrade.totalScore ,
        recovered: student.subjectGrade.recovered
      });
    }
  }, [student]);

  const handleChange = (e) => {
    
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validar que los campos no estén vacíos
    if (!form.totalScore) {
      alert("Por favor ingrese una calificación válida");
      return;
    }
    
    onSave({
      totalScore: form.totalScore,
      recovered: form.recovered
    });
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Editar calificación</h2>
        
        <div className="mb-4">
          <p className="text-gray-700 font-medium">
            Estudiante: {student?.subjectGrade?.student?.firstName} {student?.subjectGrade?.student?.lastName}
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nota anterior
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="5"
            value={student?.previousScore || ""}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nota de recuperación
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="5"
            name="totalScore"
            value={form.totalScore}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="recovered"
            value={form.recovered}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="N">Reprobado</option>
            <option value="Y">Recuperado</option>
          </select>
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

export default EditRecoveryModal;
