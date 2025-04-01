import { useState, useEffect } from "react";
import { Mail, AlertCircle, BookOpen, Layers, ChevronRight, Activity, Heart, Users, Palette, BookOpenCheck } from "lucide-react";
import GradeDistribution from "./GradeDistribution";
import FailedStudents from "./FailedStudents";
import {reportService} from "./reportService";


const SubjectsByDimension = () => {
  const [activeView, setActiveView] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para asignar iconos según el nombre de la dimensión
  const getDimensionIcon = (dimensionName) => {
    const name = dimensionName.toLowerCase();
    if (name.includes('cognitiva')) return <BookOpen className="h-5 w-5" />;
    if (name.includes('estética')) return <Palette className="h-5 w-5" />;
    if (name.includes('comunicativa')) return <Mail className="h-5 w-5" />;
    if (name.includes('corporal')) return <Activity className="h-5 w-5" />;
    if (name.includes('ética')) return <BookOpenCheck className="h-5 w-5" />;
    if (name.includes('socioafectiva')) return <Heart className="h-5 w-5" />;
    return <Layers className="h-5 w-5" />; // Icono por defecto
  };

  useEffect(() => {
    const fetchSubjectsByDimension = async () => {
      try {
        setLoading(true);
        const data = await reportService.getSubjectsByDimension();
        
        // Procesar datos para agrupar asignaturas por dimensión
        const groupedByDimension = data.reduce((acc, item) => {
          const dimensionId = item.dimension.id;
          
          // Si la dimensión no existe en el acumulador, crearla
          if (!acc[dimensionId]) {
            acc[dimensionId] = {
              id: dimensionId,
              name: item.dimension.name,
              description: item.dimension.description,
              subjects: []
            };
          }
          
          // Verificar si la asignatura ya existe en esta dimensión para evitar duplicados
          const existingSubject = acc[dimensionId].subjects.find(
            s => s.id === item.subject.id
          );
          
          if (!existingSubject) {
            // Añadir la asignatura a la dimensión correspondiente
            acc[dimensionId].subjects.push({
              id: item.subject.id,
              name: item.subject.subjectName,
              status: item.subject.status
            });
          }
          
          return acc;
        }, {});
        
        // Convertir el objeto a un array para renderizar
        const dimensionsArray = Object.values(groupedByDimension);
        
        // Asignar un icono a cada dimensión
        const dimensionsWithIcons = dimensionsArray.map(dimension => ({
          ...dimension,
          icon: getDimensionIcon(dimension.name)
        }));
        
        setDimensions(dimensionsWithIcons);
      } catch (err) {
        console.error("Error al cargar asignaturas por dimensión:", err);
        setError("No se pudieron cargar las asignaturas. Por favor, intente nuevamente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectsByDimension();
  }, []);

  const handleViewDistribution = (subject) => {
    setSelectedSubject(subject);
    setActiveView("distribution");
  };

  const handleViewFailed = (subject) => {
    setSelectedSubject(subject);
    setActiveView("failed");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Mantengo el renderizado condicional para la navegabilidad
  if (activeView === "distribution") {
    return <GradeDistribution subject={selectedSubject} onBack={() => setActiveView(null)} />;
  }

  if (activeView === "failed") {
    return <FailedStudents subject={selectedSubject} onBack={() => setActiveView(null)} />;
  }

  return (
    <div className="space-y-6">
      {dimensions.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          No hay dimensiones o asignaturas disponibles.
        </div>
      ) : (
        dimensions.map((dimension) => (
          <div key={dimension.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 flex items-center">
              <div className="bg-blue-100 rounded-lg p-2 mr-3">
                {dimension.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{dimension.name}</h2>
                {dimension.description && (
                  <p className="text-sm text-gray-500">{dimension.description}</p>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {dimension.subjects.map((subject) => (
                <div 
                  key={subject.id} 
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-gray-400 mr-3" />
                    <h3 className="font-medium text-gray-800">{subject.name}</h3>
                    {subject.status !== 'A' && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Inactiva
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleViewDistribution(subject)}
                      className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Distribución de notas</span>
                    </button>
                    <button
                      onClick={() => handleViewFailed(subject)}
                      className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>Reprobados</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SubjectsByDimension;
