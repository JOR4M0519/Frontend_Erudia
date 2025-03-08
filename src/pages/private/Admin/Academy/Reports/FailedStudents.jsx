import { useState } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";

// Datos de muestra para la tabla de reprobados
const sampleData = [
  { course: "Maternos", students: 2, p1: 0, p3: 0, p4: 0, p5: 0, p6: 0 },
  { course: "Párvulos", students: 7, p1: 0, p3: 0, p4: 0, p5: 0, p6: 0 },
  { course: "Pre jardín", students: 13, p1: 0, p3: 0, p4: 0, p5: 0, p6: 0 },
  { course: "Jardín", students: 15, p1: 0, p3: 0, p4: 0, p5: 0, p6: 0 },
  { course: "Transición", students: 22, p1: 0, p3: 0, p4: 0, p5: 0, p6: 0 }
];

const FailedStudents = ({ subject, onBack }) => {
  const [filters, setFilters] = useState({
    year: "2025",
    period: "4 periodo",
    category: "Primaria",
    type: "Simple",
    area: "Dimensión cognitiva"
  });

  // Calcular el total
  const totalStudents = sampleData.reduce((sum, row) => sum + row.students, 0);
  const totalRow = {
    course: "Total",
    students: totalStudents,
    p1: 0,
    p3: 0,
    p4: 0,
    p5: 0,
    p6: 0
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
          Reprobados
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
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-md shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center uppercase">
              REPROBADOS
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiantes
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P1
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P3
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P4
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P5
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P6
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.course}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {row.students}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {row.p1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        0
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {row.p3}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        0
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {row.p4}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        0
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {row.p5}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        0
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {row.p6}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        0
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-medium">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {totalRow.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      {totalRow.students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      {totalRow.p1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      {totalRow.p3}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      {totalRow.p4}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      {totalRow.p5}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      {totalRow.p6}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                      0
                    </td>
                  </tr>
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
