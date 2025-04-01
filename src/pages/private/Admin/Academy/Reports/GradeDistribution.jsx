import { useState, useEffect } from "react";
import { ChevronLeft, ChevronUp, AlertCircle } from "lucide-react";
import { reportService } from "./reportService";
import { motion, AnimatePresence } from "framer-motion";

const GradeDistribution = ({ subject, onBack }) => {
  const [filters, setFilters] = useState({
    year: "2025",
    period: "",
    level: "",
    subjectId: subject?.id || 1
  });
  
  const [showGroupGraphs, setShowGroupGraphs] = useState(true);
  const [gradeData, setGradeData] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [educationalLevels, setEducationalLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar periodos y niveles educativos al inicio
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Cargar periodos
        const periodsData = await reportService.getPeriods(filters.year);
        setPeriods(periodsData);
        
        if (periodsData.length > 0) {
          setFilters(prev => ({
            ...prev,
            period: periodsData[0].id.toString()
          }));
        }
        
        // Cargar niveles educativos
        const levelsData = await reportService.getEducationalLevels();
        setEducationalLevels(levelsData);
        
        if (levelsData.length > 0) {
          setFilters(prev => ({
            ...prev,
            level: levelsData[0].id.toString()
          }));
        }
      } catch (err) {
        setError("Error al cargar datos iniciales");
        console.error(err);
      }
    };

    fetchInitialData();
  }, []);

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    if (filters.year && filters.period && filters.level && filters.subjectId) {
      const fetchGradeDistribution = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await reportService.getGradeDistribution(
            filters.year,
            filters.period,
            filters.level,
            filters.subjectId
          );
          setGradeData(data);
        } catch (err) {
          setError("Error al cargar los datos de distribución de notas");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchGradeDistribution();
    }
  }, [filters]);

  // Recargar periodos cuando cambie el año
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const periodsData = await reportService.getPeriods(filters.year);
        setPeriods(periodsData);
        
        if (periodsData.length > 0) {
          setFilters(prev => ({
            ...prev,
            period: periodsData[0].id.toString()
          }));
        } else {
          setFilters(prev => ({
            ...prev,
            period: ""
          }));
        }
      } catch (err) {
        console.error("Error al cargar periodos:", err);
      }
    };

    fetchPeriods();
  }, [filters.year]);

  // Convertir datos para el gráfico
  const convertToChartData = (groupData) => {
    const result = [];
    
    if (groupData.basicCount > 0) {
      result.push({
        level: "Básico",
        count: groupData.basicCount,
        percentage: Math.round((groupData.basicCount / groupData.totalStudents) * 100)
      });
    }
    
    if (groupData.highCount > 0) {
      result.push({
        level: "Alto",
        count: groupData.highCount,
        percentage: Math.round((groupData.highCount / groupData.totalStudents) * 100)
      });
    }
    
    if (groupData.superiorCount > 0) {
      result.push({
        level: "Superior",
        count: groupData.superiorCount,
        percentage: Math.round((groupData.superiorCount / groupData.totalStudents) * 100)
      });
    }
    
    return result;
  };

  const renderPieChart = (data, title, totalStudents) => {
    // Paleta de colores mejorada para el diagrama de torta
    const colorMap = {
      "Superior": "#4F46E5", // Índigo
      "Alto": "#10B981",     // Esmeralda
      "Básico": "#F59E0B",   // Ámbar
    };
    
    // Animación para el gráfico circular con crecimiento
    const chartContainerVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          duration: 0.5,
          staggerChildren: 0.1
        }
      }
    };


    // Animación para los segmentos del gráfico
    const segmentVariants = {
      hidden: { 
        pathLength: 0,
        scale: 0.8,
        opacity: 0 
      },
      visible: (i) => ({ 
        pathLength: 1,
        scale: 1,
        opacity: 1,
        transition: { 
          delay: i * 0.1,
          duration: 0.8,
          ease: "easeInOut"
        }
      })
    };
    
    // Animación para la leyenda
    const legendVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i) => ({ 
        opacity: 1, 
        y: 0,
        transition: { 
          delay: 0.3 + (i * 0.1),
          duration: 0.3
        }
      })
    };
    
     // Si no hay estudiantes, mostrar mensaje
  if (totalStudents === 0 || data.length === 0) {
    return (
      <motion.div 
        className="bg-white rounded-lg shadow-md overflow-hidden h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-5 border-b">
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div className="p-5 flex flex-col items-center justify-center h-64">
          <AlertCircle className="text-amber-500 mb-3 w-12 h-12" />
          <p className="text-gray-600 text-center">No hay estudiantes registrados en este grupo</p>
        </div>
      </motion.div>
    );
  }
    
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden h-full"
      initial="hidden"
      animate="visible"
      variants={chartContainerVariants}
    >
      <div className="p-5 border-b">
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>
      <div className="p-5">
        <div className="relative w-48 h-48 mx-auto">
          {/* Círculo base (fondo gris) */}
          <motion.svg 
            viewBox="0 0 100 100" 
            className="w-full h-full"
            initial={{ rotate: -90 }}
            animate={{ rotate: -90 }}
          >
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="20"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            
            {/* CORRECCIÓN PARA CASO DE 100% */}
            {data.length === 1 && data[0].percentage === 100 ? (
              // Si hay un solo segmento con 100%, dibujamos un círculo completo
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={colorMap[data[0].level] || "#4F46E5"}
                strokeWidth="20"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            ) : (
              // Caso normal: múltiples segmentos
              data.map((segment, index) => {
                // Calcular ángulos para el arco SVG
                const startPercent = data.slice(0, index).reduce((sum, d) => sum + d.percentage, 0) / 100;
                const endPercent = startPercent + segment.percentage / 100;
                
                return (
                  <motion.path
                    key={index}
                    d={describeArc(50, 50, 40, startPercent * 360 - 90, endPercent * 360 - 90)}
                    fill="none"
                    stroke={colorMap[segment.level] || "#CCCCCC"}
                    strokeWidth="20"
                    strokeLinecap="round"
                    custom={index}
                    variants={segmentVariants}
                  />
                );
              })
            )}
          </motion.svg>
          
          {/* Texto central con el total */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
              <p className="text-xs text-gray-500">Estudiantes</p>
            </motion.div>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          {data.map((segment, index) => (
            <motion.div 
              key={index} 
              className="flex items-center text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + (index * 0.1) }}
            >
              <span 
                className="w-4 h-4 mr-2 inline-block rounded-sm" 
                style={{ backgroundColor: colorMap[segment.level] }}
              ></span>
              <span className="text-gray-700 flex-1">{segment.level}</span>
              <span className="font-medium">{segment.count} ({segment.percentage}%)</span>
            </motion.div>
          ))}
          <motion.div 
            className="text-sm mt-3 font-medium text-gray-800 pt-2 border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Total: {totalStudents} estudiantes
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

  // Función para describir un arco SVG (para la animación del diagrama)
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // Función auxiliar para convertir coordenadas polares a cartesianas
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // Animaciones para los elementos de la página
  const pageTransition = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      className="p-6 max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={pageTransition}
    >
      <motion.div 
        className="flex items-center mb-8"
        variants={itemVariant}
      >
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4 transition-colors duration-200"
        >
          <ChevronLeft size={18} />
          <span className="ml-1">Volver</span>
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          Distribución de Notas - {subject?.name || "Matemáticas"}
        </h2>
      </motion.div>

      {/* Filtros */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={staggerContainer}
      >
        <motion.div variants={itemVariant}>
          <label className="block text-sm font-medium mb-2 text-gray-700">Año</label>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 bg-white"
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </motion.div>
        <motion.div variants={itemVariant}>
          <label className="block text-sm font-medium mb-2 text-gray-700">Periodo</label>
          <select
            name="period"
            value={filters.period}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 bg-white"
            disabled={periods.length === 0}
          >
            {periods.length === 0 ? (
              <option value="">No hay periodos disponibles</option>
            ) : (
              periods.map(period => (
                <option key={period.id} value={period.id.toString()}>
                  {period.name}
                </option>
              ))
            )}
          </select>
        </motion.div>
        <motion.div variants={itemVariant}>
          <label className="block text-sm font-medium mb-2 text-gray-700">Nivel Educativo</label>
          <select
            name="level"
            value={filters.level}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 bg-white"
            disabled={educationalLevels.length === 0}
          >
            {educationalLevels.length === 0 ? (
              <option value="">No hay niveles disponibles</option>
            ) : (
              educationalLevels.map(level => (
                <option key={level.id} value={level.id.toString()}>
                  {level.levelName}
                </option>
              ))
            )}
          </select>
        </motion.div>
      </motion.div>

      {/* Mostrar error si existe */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mostrar cargando */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            className="text-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Distribución por grupos */}
      {!loading && !error && (
        <motion.div 
          className="mb-8"
          variants={itemVariant}
        >
          <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-800">Distribución por Grupos</h3>
            <button 
              onClick={() => setShowGroupGraphs(!showGroupGraphs)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-white px-3 py-1 rounded-md shadow-sm hover:shadow border border-gray-200"
            >
              {showGroupGraphs ? "Ocultar" : "Mostrar"}
              <ChevronUp 
                size={18} 
                className={`ml-1 transform transition-transform duration-300 ${showGroupGraphs ? '' : 'rotate-180'}`}
              />
            </button>
          </div>
          
          {/* Mostrar mensaje cuando no hay datos */}
          <AnimatePresence>
            {!loading && !error && gradeData.length === 0 && (
              <motion.div 
                className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-3" />
                <p className="text-gray-600">No hay datos disponibles para los filtros seleccionados.</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Mostrar gráficos */}
          <AnimatePresence>
            {showGroupGraphs && gradeData.length > 0 && (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                {gradeData.map((group, index) => (
                  <motion.div 
                    key={index}
                    variants={itemVariant}
                    custom={index}
                    layout
                  >
                    {renderPieChart(
                      convertToChartData(group), 
                      group.groupName, 
                      group.totalStudents
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GradeDistribution;
