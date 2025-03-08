import { useState } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";

// Datos de muestra para los gráficos
const sampleData = {
  "Párvulos": [
    { level: "Superior", count: 12, percentage: 100 }
  ],
  "Pre jardín": [
    { level: "Superior", count: 6, percentage: 50 },
    { level: "Alto", count: 6, percentage: 50 }
  ],
  "Jardín": [
    { level: "Superior", count: 6, percentage: 50 },
    { level: "Alto", count: 3, percentage: 25 },
    { level: "Básico", count: 3, percentage: 25 }
  ]
};

const GradeDistribution = ({ subject, onBack }) => {
  const [filters, setFilters] = useState({
    year: "2025",
    period: "4 periodo",
    category: "Primaria",
    type: "Simple",
    area: "Dimensión cognitiva"
  });
  const [showGroupGraphs, setShowGroupGraphs] = useState(true);

  const renderPieChart = (data, title) => {
    // Asignar colores consistentes por nivel
    const colorMap = {
      "Superior": "#E5E5E5", // Light gray
      "Alto": "#A0A0A0",     // Medium gray
      "Básico": "#505050",   // Dark gray
      "Bajo": "#303030"      // Very dark gray
    };
    
    return (
      <div className="border rounded p-4">
        <h3 className="font-medium mb-4">{title}</h3>
        <div className="relative w-48 h-48 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {data.map((segment, index) => {
              // Para un gráfico circular simple
              const total = data.reduce((sum, d) => sum + d.percentage, 0);
              const startAngle = data.slice(0, index).reduce((sum, d) => sum + d.percentage, 0) * 3.6; // 360 / 100 = 3.6
              const endAngle = startAngle + segment.percentage * 3.6;
              
              // Convertir ángulos a coordenadas
              const startRad = ((startAngle - 90) * Math.PI) / 180;
              const endRad = ((endAngle - 90) * Math.PI) / 180;
              
              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);
              
              const largeArcFlag = segment.percentage > 50 ? 1 : 0;
              
              const pathData = `
                M 50 50
                L ${x1} ${y1}
                A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
              `;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={colorMap[segment.level] || "#CCCCCC"}
                />
              );
            })}
          </svg>
        </div>
        <div className="mt-4 flex flex-col items-center">
          {data.map((segment, index) => (
            <div key={index} className="flex items-center mb-1 text-sm">
              <span className="inline-block w-3 h-3 mr-2" style={{ backgroundColor: colorMap[segment.level] }}></span>
              <span>{segment.level} ({segment.count})</span>
            </div>
          ))}
        </div>
      </div>
    );
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
          Distribución de notas matemáticas
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Año escolar</label>
              <div className="mt-1 relative">
                <button type="button" className="flex justify-between w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm">
                  <span>{filters.year}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Periodo</label>
              <div className="mt-1 relative">
                <button type="button" className="flex justify-between w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm">
                  <span>{filters.period}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <div className="mt-1 relative">
                <button type="button" className="flex justify-between w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm">
                  <span>{filters.category}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <div className="mt-1 relative">
                <button type="button" className="flex justify-between w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm">
                  <span>{filters.type}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Área</label>
              <div className="mt-1">
                <input
                  type="text"
                  className="px-3 py-2 border border-gray-300 rounded-md w-full bg-gray-100"
                  value={filters.area}
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{subject?.name || "Matemáticas"}</label>
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

          <div className="mt-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
                checked={showGroupGraphs}
                onChange={() => setShowGroupGraphs(!showGroupGraphs)}
              />
              <span className="ml-2 text-sm text-gray-700">Mostrar gráficos por grupo</span>
            </label>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-md shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center uppercase">
              DISTRIBUCIÓN DE NOTAS {subject?.name || "MATEMÁTICAS"}
            </h2>
            
            {showGroupGraphs && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(sampleData).map(([group, data]) => (
                  renderPieChart(data, group)
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeDistribution;
