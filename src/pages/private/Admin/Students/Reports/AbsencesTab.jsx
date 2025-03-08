import React, { useState, useEffect } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { adminStudentService } from "../..";

const AbsencesTab = ({ year }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [absenceData, setAbsenceData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await adminStudentService.getAbsenceReport(year);
        setAbsenceData(data);
      } catch (err) {
        setError("No se pudieron cargar los datos de ausencias. Intente nuevamente.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Datos simulados para desarrollo
  const mockData = [
    {
      id: 1,
      name: "Grado Cuarto",
      level: "Primaria",
      stats: {
        ultimoRegistro: "Sin registros",
        totalActivos: 1,
        justificados: 0,
        noJustificados: 2
      }
    },
    {
      id: 2,
      name: "Grado Quinto",
      level: "Primaria",
      stats: {
        ultimoRegistro: "Sin registros",
        totalActivos: 1,
        justificados: 0,
        noJustificados: 2
      }
    }
  ];

  const data = absenceData.length > 0 ? absenceData : mockData;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reporte ausencias</h2>

      {data.map((grade, index) => (
        <motion.div
          key={grade.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="mb-8"
        >
          <div className="mb-2">
            <h3 className="text-lg font-semibold">{grade.name}</h3>
            <p className="text-sm text-gray-500">{grade.level}</p>
          </div>

          <div className="space-y-2 bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span>Último registro</span>
                </div>
                <span className="text-gray-600">{grade.stats.ultimoRegistro}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span>Total activos</span>
                <span className="font-semibold">{grade.stats.totalActivos}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                <span>Justificados</span>
                <span className="font-semibold text-green-600">{grade.stats.justificados}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span>No justificados</span>
                </div>
                <span className="font-semibold text-red-600">{grade.stats.noJustificados}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AbsencesTab;
