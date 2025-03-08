import React, { useState } from "react";
import { ArrowLeft, Search, Download, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const NewStudentsDetail = ({ students, onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("codigo");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (column) => {
    if (sortBy === column) {
      // Si ya estamos ordenando por esta columna, cambiamos la dirección
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Si es una columna nueva, ordenamos ascendentemente
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.codigo.toString().includes(searchQuery) ||
      student.matricula.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === "codigo") {
      comparison = a.codigo - b.codigo;
    } else if (sortBy === "nombre") {
      comparison = a.nombre.localeCompare(b.nombre);
    } else if (sortBy === "matricula") {
      comparison = a.matricula.localeCompare(b.matricula);
    } else if (sortBy === "estado") {
      comparison = a.estado.localeCompare(b.estado);
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const exportToCsv = () => {
    // Implementación de exportación a CSV
    const headers = ["Código", "Nombre", "Matrícula", "Estado"];
    const data = sortedStudents.map(s => [s.codigo, s.nombre, s.matricula, s.estado]);
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nuevos_estudiantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Volver a resumen</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Reporte Nuevos DETAIL</h2>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="relative w-full md:w-64 mb-4 md:mb-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Buscar estudiantes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <button
            onClick={exportToCsv}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("codigo")}
                >
                  <div className="flex items-center">
                    Código del estudiante
                    {sortBy === "codigo" && (
                      sortDirection === "asc" ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("nombre")}
                >
                  <div className="flex items-center">
                    Nombre del estudiante
                    {sortBy === "nombre" && (
                      sortDirection === "asc" ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("matricula")}
                >
                  <div className="flex items-center">
                    Matrícula
                    {sortBy === "matricula" && (
                      sortDirection === "asc" ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("estado")}
                >
                  <div className="flex items-center">
                    Estado
                    {sortBy === "estado" && (
                      sortDirection === "asc" ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStudents.length > 0 ? (
                sortedStudents.map((student, index) => (
                  <tr 
                    key={student.id} 
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.matricula}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {student.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                    No se encontraron estudiantes con estos criterios de búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{filteredStudents.length}</span> estudiantes
              </p>
            </div>
            <div>
              <button
                onClick={onBack}
                className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewStudentsDetail;
