import React, { useState, useEffect } from "react";
import { Calendar, AlertCircle, Clock, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { studentAdminService } from "../studentAdminService";

const AbsencesTab = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [absenceData, setAbsenceData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await studentAdminService.getAttendanceGroupReport();
        setAbsenceData(data);
      } catch (err) {
        setError("No se pudieron cargar los datos de asistencia. Intente nuevamente.");
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

  // Agrupar datos por nivel educativo
  const groupedByLevel = absenceData.reduce((acc, group) => {
    if (!acc[group.levelName]) {
      acc[group.levelName] = [];
    }
    acc[group.levelName].push(group);
    return acc;
  }, {});

  const formatDate = (dateString) => {
    if (!dateString) return "Sin registros";
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reporte de asistencia</h2>

      {Object.entries(groupedByLevel).map(([levelName, groups], levelIndex) => (
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último registro
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activos
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presentes
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tardanzas
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ausencias
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
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{group.groupName}</div>
                        <div className="text-sm text-gray-500">{group.sectionName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDate(group.lastRecord)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <UserCheck className="h-4 w-4 mr-1" />
                        {group.totalActive}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {group.presentCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-4 w-4 mr-1" />
                        {group.lateCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {group.absentCount}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AbsencesTab;
