import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { studentAdminService } from "../studentAdminService";


const AcademicLevelTab = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [academicData, setAcademicData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await studentAdminService.getAcademicLevelReport();
        
        // Procesar y agrupar los datos por nivel educativo y grupo
        const groupedByLevel = {};
        
        data.forEach(item => {
          // Si el nivel no existe en nuestro objeto agrupado, lo inicializamos
          if (!groupedByLevel[item.levelName]) {
            groupedByLevel[item.levelName] = {};
          }
          
          // Si el grupo no existe en este nivel, lo inicializamos
          if (!groupedByLevel[item.levelName][item.groupName]) {
            groupedByLevel[item.levelName][item.groupName] = {
              groupId: item.groupId,
              groupName: item.groupName,
              levelName: item.levelName,
              stats: {}
            };
          }
          
          // Añadimos el conteo de este estado para este grupo
          groupedByLevel[item.levelName][item.groupName].stats[item.statusName.toLowerCase()] = item.studentsTotal;
        });
        
        // Convertir el objeto anidado a un array plano para renderizar
        const formattedData = [];
        
        Object.entries(groupedByLevel).forEach(([levelName, groups]) => {
          Object.values(groups).forEach(group => {
            formattedData.push({
              id: group.groupId,
              name: group.groupName,
              level: levelName,
              stats: group.stats
            });
          });
        });
        
        setAcademicData(formattedData);
      } catch (err) {
        setError("No se pudieron cargar los datos académicos. Intente nuevamente.");
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

  // Agrupar por nivel educativo para mostrar encabezados
  const groupedByLevel = academicData.reduce((acc, item) => {
    if (!acc[item.level]) {
      acc[item.level] = [];
    }
    acc[item.level].push(item);
    return acc;
  }, {});

  // Función para determinar el color según el estado
  const getStatusColor = (status) => {
    const colors = {
      activo: "bg-green-600",
      inscrito: "bg-blue-600",
      retirado: "bg-red-600",
      suspendido: "bg-yellow-600",
      pendiente: "bg-purple-600",
      nuevo: "bg-indigo-600",
      egresado: "bg-gray-600"
    };
    return colors[status.toLowerCase()] || "bg-blue-600";
  };

  // Función para calcular el total de estudiantes en un grupo
  const getTotalStudents = (stats) => {
    return Object.values(stats).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reporte Nivel académico</h2>

      {Object.entries(groupedByLevel).map(([levelName, groups], levelIndex) => (
        <motion.div
          key={levelName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: levelIndex * 0.1 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">{levelName}</h3>

          {groups.map((group, groupIndex) => (
            <motion.div
              key={`${group.id}-${groupIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (levelIndex * 0.1) + (groupIndex * 0.05) }}
              className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="mb-3">
                <h4 className="text-lg font-semibold">{group.name}</h4>
                <p className="text-sm text-gray-500">Total: {getTotalStudents(group.stats)} estudiantes</p>
              </div>

              <div className="space-y-2">
                {Object.entries(group.stats).map(([status, count]) => (
                  <div 
                    key={status} 
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <span className="font-medium capitalize">{status}</span>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold">{count}</span>
                      <div className="ml-8 w-56 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`${getStatusColor(status)} h-2.5 rounded-full`} 
                          style={{
                            width: `${Math.min(100, (count / getTotalStudents(group.stats)) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ))}

      {academicData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos disponibles para mostrar.
        </div>
      )}
    </div>
  );
};

export default AcademicLevelTab;
