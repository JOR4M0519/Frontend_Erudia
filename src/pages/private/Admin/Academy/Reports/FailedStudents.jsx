import { useState, useEffect } from "react";
import { ChevronLeft, ChevronDown, Check, X } from "lucide-react";
import Swal from "sweetalert2";
import { reportService } from "./";

const FailedStudents = ({ subject, onBack }) => {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    levelId: "",
    subjectId: subject?.id || 1
  });
  
  const [loading, setLoading] = useState(false);
  const [recoveryData, setRecoveryData] = useState([]);
  const [educationalLevels, setEducationalLevels] = useState([]);

  // Cargar niveles educativos al montar el componente
  useEffect(() => {
    fetchEducationalLevels();
  }, []);

  // Cargar datos de recuperación cuando cambian los filtros
  useEffect(() => {
    if (filters.levelId) {
      fetchRecoveryData();
    }
  }, [filters.year, filters.levelId, filters.subjectId]);

  const fetchEducationalLevels = async () => {
    try {
      const data = await reportService.getEducationalLevels();
      setEducationalLevels(data);
      if (data.length > 0) {
        setFilters(prev => ({ ...prev, levelId: data[0].id }));
      }
    } catch (error) {
      console.error("Error al obtener niveles educativos:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los niveles educativos'
      });
    }
  };

  const fetchRecoveryData = async () => {
    try {
      setLoading(true);
      const data = await reportService.getRecoveryReport(
        filters.subjectId,
        filters.levelId,
        filters.year
      );
      setRecoveryData(data);
    } catch (error) {
      console.error("Error al obtener datos de recuperación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos de recuperación'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setFilters(prev => ({ ...prev, year }));
  };

  const handleLevelChange = (levelId) => {
    setFilters(prev => ({ ...prev, levelId }));
  };

  // Formatear número con 2 decimales
  const formatNumber = (num) => {
    return Number(num).toFixed(2);
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="bg-gray-700 text-white px-6 py-2 rounded-full">
          Recuperaciones
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Año escolar</label>
              <div className="mt-1 relative">
                <select
                  value={filters.year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="appearance-none w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - 2 + i}>
                      {new Date().getFullYear() - 2 + i}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <div className="mt-1 relative">
                <select
                  value={filters.levelId}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="appearance-none w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {educationalLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.levelName}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Materia</label>
              <div className="mt-1">
                <input
                  type="text"
                  className="px-3 py-2 border border-gray-300 rounded-md w-full bg-gray-100"
                  value={subject?.name || "Matemáticas"}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-md shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center uppercase">
              REPORTE DE RECUPERACIONES
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grupo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período (%)
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota Anterior
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota Final
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recuperó
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                        <p className="mt-2 text-gray-500">Cargando datos...</p>
                      </td>
                    </tr>
                  ) : recoveryData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6">
                        <p className="text-gray-500">No hay datos de recuperación disponibles.</p>
                      </td>
                    </tr>
                  ) : (
                    recoveryData.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {`${item.subjectGrade.student.firstName} ${item.subjectGrade.student.lastName}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.groupsDomain.groupName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {`${item.subjectGrade.period.name} (${item.subjectGrade.period.percentage}%)`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {formatNumber(item.previousScore)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {formatNumber(item.subjectGrade.totalScore)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          {item.subjectGrade.recovered === "Y" ? (
                            <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <Check size={16} className="mr-1" /> Sí
                            </span>
                          ) : (
                            <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              <X size={16} className="mr-1" /> No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailedStudents;
