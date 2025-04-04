import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { studentAdminService } from "../studentAdminService";


const RepeatingTab = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repeatingData, setRepeatingData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await studentAdminService.getRepeatingStudentsReport();
        setRepeatingData(data);
      } catch (err) {
        setError("No se pudieron cargar los datos de repitentes. Intente nuevamente.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Agrupar por nivel educativo
  const groupedByLevel = repeatingData.reduce((acc, item) => {
    if (!acc[item.levelName]) {
      acc[item.levelName] = [];
    }
    acc[item.levelName].push(item);
    return acc;
  }, {});

  // Calcular el total de repitentes
  const totalRepeating = repeatingData.reduce((sum, group) => sum + group.repeatingCount, 0);

  // Encontrar el valor máximo para escalar las barras de progreso
  const maxRepeating = Math.max(...repeatingData.map(group => group.repeatingCount), 1);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reporte Repitentes</h2>
        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          <span>Total: {totalRepeating} repitentes</span>
        </div>
      </div>

      {Object.entries(groupedByLevel).length > 0 ? (
        Object.entries(groupedByLevel).map(([levelName, groups], levelIndex) => (
          <motion.div
            key={levelName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: levelIndex * 0.1 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">{levelName}</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grupo
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Repitentes
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distribución
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groups.map((group, groupIndex) => (
                    <motion.tr 
                      key={group.groupId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (levelIndex * 0.1) + (groupIndex * 0.05) }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{group.groupName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          group.repeatingCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {group.repeatingCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${group.repeatingCount > 0 ? 'bg-amber-500' : 'bg-gray-400'}`}
                            style={{width: `${Math.min(100, (group.repeatingCount / maxRepeating) * 100)}%`}}
                          ></div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          No hay datos de estudiantes repitentes disponibles.
        </div>
      )}
    </div>
  );
};

export default RepeatingTab;
