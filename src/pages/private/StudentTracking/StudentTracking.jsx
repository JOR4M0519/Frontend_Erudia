import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { studentDataService } from "../Dashboard/StudentLayout";
import { useSelector } from "react-redux";
import {ObservationModal} from "./";
import { BackButton } from "../../../components";
import { useNavigate } from "react-router-dom";

export default function StudentTracking() {
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [observations, setObservations] = useState([]);
  const navigate = useNavigate();
  const userState = useSelector((store) => store.selectedUser);

  useEffect(() => {
    if (!userState.id) return;

    // 🔹 Obtener observaciones del estudiante
    const fetchObservations = async () => {
      const data = await studentDataService.getStudentObservations(userState.id);
      setObservations(data);
    };

    fetchObservations();
  }, [userState]);

  const handleExport = () => {
    console.log("Exportando observador...");
    // Aquí puedes agregar lógica para exportar datos a CSV/PDF
  };

  return (
    <div className="space-y-4">
      {/* 🔹 Encabezado */}
      <div className="flex items-center justify-between gap-20">
        <div className="flex items-center gap-10 flex-1 bg-gray-200 rounded-full p-4">
          <span className="font-medium text-gray-800 px-4">Observaciones del Estudiante</span>
        </div>
      </div>

      {/* 🔹 Tabla de Observaciones */}
      <div className="bg-gray-100 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
        <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-gray-600 border-b border-gray-200">
          <div className="col-span-4">Observador</div>
          <div className="col-span-4 text-center">Fecha</div>
          <div className="col-span-4 text-center">Profesor</div>
        </div>

        <div className="divide-y divide-gray-200">
          {observations.length > 0 ? (
            observations.map((observation) => (
              <div
                key={observation.id}
                onClick={() => setSelectedObservation(observation)}
                className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-300 transition-colors items-center cursor-pointer rounded-lg bg-gray-200 m-2"
              >
                <div className="col-span-4 font-medium text-gray-700">{observation.title}</div>
                <div className="col-span-4 text-center text-gray-600">{observation.date}</div>
                <div className="col-span-4 text-center text-gray-700">{observation.teacher.firstName+" "+observation.teacher.lastName}</div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center p-4">No hay observaciones disponibles.</p>
          )}
        </div>
      </div>

      {/* 🔹 Botón de Exportar */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exportar observador</span>
        </button>
      </div>

      <BackButton onClick={() => navigate("/dashboard")} />

      {/* 🔹 Modal de Observación */}
      {selectedObservation && (
        <ObservationModal
          isOpen={!!selectedObservation}
          observation={selectedObservation}
          onClose={() => setSelectedObservation(null)}
        />
      )}
    </div>
  );
}
