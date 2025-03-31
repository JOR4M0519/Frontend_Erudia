import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import {FailedStudentsListProcess, reportService} from "./"; // Importamos el componente

const RecoveryReports = () => {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    periodId: "",
    levelId: "",
  });

  const [loading, setLoading] = useState(false);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [educationalLevels, setEducationalLevels] = useState([]);
  const [groupedSubjects, setGroupedSubjects] = useState({});
  
  // Estado para controlar la navegación
  const [currentView, setCurrentView] = useState("main");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Cargar niveles educativos y períodos al montar el componente
  useEffect(() => {
    fetchEducationalLevels();
    fetchPeriods(filters.year);
  }, []);

  // Cargar materias por grupo cuando cambian los filtros
  useEffect(() => {
    if (filters.periodId && filters.levelId) {
      fetchSubjectsByGroup();
    }
  }, [filters.periodId, filters.levelId]);

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

  const fetchPeriods = async (year) => {
    try {
      const data = await reportService.getPeriods(year);
      setPeriods(data);
      if (data.length > 0) {
        setFilters(prev => ({ ...prev, periodId: data[0].id }));
      }
    } catch (error) {
      console.error("Error al obtener períodos:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los períodos'
      });
    }
  };

  const fetchSubjectsByGroup = async () => {
    try {
      setLoading(true);
      const data = await reportService.getSubjectsByGroupAndLevel(
        filters.periodId,
        filters.levelId
      );
      setSubjectGroups(data);
      
      // Agrupar materias por grupo
      const grouped = data.reduce((acc, item) => {
        const groupName = item.groups.groupName;
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(item);
        return acc;
      }, {});
      
      setGroupedSubjects(grouped);
    } catch (error) {
      console.error("Error al obtener materias por grupo:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las materias por grupo'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setFilters(prev => ({ ...prev, year }));
    fetchPeriods(year);
  };

  const handlePeriodChange = (periodId) => {
    setFilters(prev => ({ ...prev, periodId }));
  };

  const handleLevelChange = (levelId) => {
    setFilters(prev => ({ ...prev, levelId }));
  };

// Función actualizada para manejar el clic en "Reprobados"
const handleFailedClick = (subject, groupName) => {
  setSelectedSubject({
    id: subject.subjectProfessor.subject.id,
    name: subject.subjectProfessor.subject.subjectName
  });
  
  // Buscar el objeto de grupo completo basado en el nombre del grupo
  const groupObj = subjectGroups.find(item => 
    item.groups && item.groups.groupName === groupName
  );
  
  setSelectedGroup({
    id: groupObj?.groups?.id || null,
    groupName: groupName
  });
  
  setCurrentView("failedStudents");
};


  // Función para volver a la vista principal
  const handleBackToMain = () => {
    setCurrentView("main");
    setSelectedSubject(null);
    setSelectedGroup(null);
  };

  // Renderizado condicional basado en la vista actual
  if (currentView === "failedStudents" && selectedSubject) {
    return (
      <FailedStudentsListProcess 
        subject={selectedSubject} 
        group={selectedGroup}
        levelId={filters.levelId}
        onBack={handleBackToMain} 
      />
    );
  }

  return (
    <div>
      {/* <div className="mb-6 flex items-center space-x-4">
        <div className={`px-6 py-2 rounded-full cursor-pointer ${true ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-700'}`}>
          Por materia
        </div>
        <div className={`px-6 py-2 rounded-full cursor-pointer ${true ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-700'}`}>
          Recuperaciones
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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
              <label className="block text-sm font-medium text-gray-700">Periodo</label>
              <div className="mt-1 relative">
                <select
                  value={filters.periodId}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="appearance-none w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
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
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-500">Cargando datos...</p>
            </div>
          ) : Object.keys(groupedSubjects).length === 0 ? (
            <div className="bg-white p-6 rounded-md shadow-sm text-center">
              <p className="text-gray-500">No hay datos disponibles para los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {console.log(groupedSubjects)}
              {Object.entries(groupedSubjects).map(([groupName, subjects]) => (
                <div key={groupName} className="bg-white p-6 rounded-md shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    {groupName} <ChevronDown className="ml-2 h-5 w-5" />
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <tbody className="divide-y divide-gray-200">
                        {subjects.map((item) => (
                          <tr key={item.id}>
                            <td className="py-3 text-sm font-medium text-gray-900 w-2/3">
                              {item.subjectProfessor.subject.subjectName}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleFailedClick(item, groupName)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Reprobados
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoveryReports;
