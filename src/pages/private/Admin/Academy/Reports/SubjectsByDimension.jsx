import { useState } from "react";
import { Mail, AlertCircle, BookOpen, Layers, ChevronRight } from "lucide-react";
import GradeDistribution from "./GradeDistribution";
import FailedStudents from "./FailedStudents";

// Datos de muestra
const dimensionsData = [
  {
    id: 1,
    name: "Dimensión cognitiva",
    icon: <BookOpen className="h-5 w-5" />,
    subjects: [
      { id: 1, name: "Matemáticas" },
      { id: 2, name: "Áreas integradas" },
      { id: 3, name: "Inglés" }
    ]
  },
  {
    id: 2,
    name: "Dimensión estética",
    icon: <Layers className="h-5 w-5" />,
    subjects: [
      { id: 4, name: "Manualidades" },
      { id: 5, name: "Música" },
      { id: 6, name: "Danza" }
    ]
  }
];

const SubjectsByDimension = () => {
  const [activeView, setActiveView] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleViewDistribution = (subject) => {
    setSelectedSubject(subject);
    setActiveView("distribution");
  };

  const handleViewFailed = (subject) => {
    setSelectedSubject(subject);
    setActiveView("failed");
  };

  // Mantengo el renderizado condicional original para conservar la navegabilidad
  if (activeView === "distribution") {
    return <GradeDistribution subject={selectedSubject} onBack={() => setActiveView(null)} />;
  }

  if (activeView === "failed") {
    return <FailedStudents subject={selectedSubject} onBack={() => setActiveView(null)} />;
  }

  return (
    <div className="space-y-6">
      {dimensionsData.map((dimension) => (
        <div key={dimension.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 flex items-center">
            <div className="bg-blue-100 rounded-lg p-2 mr-3">
              {dimension.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{dimension.name}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {dimension.subjects.map((subject) => (
              <div key={subject.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors hover:bg-gray-50">
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-400 mr-3" />
                  <h3 className="font-medium text-gray-800">{subject.name}</h3>
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
      ))}
    </div>
  );
};

export default SubjectsByDimension;
