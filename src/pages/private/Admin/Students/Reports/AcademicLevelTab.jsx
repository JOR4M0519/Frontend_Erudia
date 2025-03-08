import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { adminStudentService } from "../..";

const AcademicLevelTab = ({ year }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [academicData, setAcademicData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await adminStudentService.getAcademicLevelReport(year);
        setAcademicData(data);
      } catch (err) {
        setError("No se pudieron cargar los datos académicos. Intente nuevamente.");
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
        activo: 18,
        nuevo: 1,
        suspendido: 0,
        pendiente: 2,
        retirado: 8,
        inscrito: 0,
        egresado: 0
      }
    },
    {
      id: 2,
      name: "Grado Quinto",
      level: "Primaria",
      stats: {
        activo: 18,
        nuevo: 0,
        suspendido: 0,
        pendiente: 0,
        retirado: 0,
        inscrito: 0,
        egresado: 0
      }
    }
  ];

  const data = academicData.length > 0 ? academicData : mockData;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reporte Nivel académico</h2>

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

          <div className="space-y-2">
            {Object.entries(grade.stats).map(([status, count]) => (
              <div 
                key={status} 
                className="flex items-center justify-between bg-gray-100 p-3 rounded-md"
              >
                <span className="font-medium capitalize">{status}</span>
                <div className="flex items-center">
                  <span className="text-lg font-semibold">{count}</span>
                  <div className="ml-8 w-56 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{width: `${Math.min(100, (count / 20) * 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AcademicLevelTab;
