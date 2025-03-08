import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { adminStudentService } from "../..";

const RepeatingTab = ({ year }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repeatingData, setRepeatingData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await adminStudentService.getRepeatingStudentsReport(year);
        setRepeatingData(data);
      } catch (err) {
        setError("No se pudieron cargar los datos de repitentes. Intente nuevamente.");
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
      repeating: 0
    },
    {
      id: 2,
      name: "Grado Quinto",
      level: "Primaria",
      repeating: 3
    },
    {
      id: 3,
      name: "Grado Sexto",
      level: "Primaria",
      repeating: 1
    }
  ];

  const data = repeatingData.length > 0 ? repeatingData : mockData;
  
  // Calcular el total de repitentes
  const totalRepeating = data.reduce((sum, grade) => sum + grade.repeating, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reporte Repitentes</h2>
        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          <span>Total: {totalRepeating} repitentes</span>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((grade, index) => (
          <motion.div
            key={grade.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{grade.name}</h3>
                <p className="text-sm text-gray-500">{grade.level}</p>
              </div>
              <div className="flex items-center">
                <div className={`px-4 py-2 rounded-full ${grade.repeating > 0 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  <span className="font-semibold">{grade.repeating}</span>
                </div>
                <div className="ml-4 w-32 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${grade.repeating > 0 ? 'bg-amber-500' : 'bg-gray-400'}`}
                    style={{width: `${Math.min(100, (grade.repeating / 10) * 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RepeatingTab;
