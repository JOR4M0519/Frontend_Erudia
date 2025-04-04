import React, { useState, useEffect } from "react";
import { Search, UserPlus, ArrowRight, Filter } from "lucide-react";
import { motion } from "framer-motion";
import {NewStudentsDetail} from "./";
import { adminStudentService } from "../../AdminService";


const NewStudentsTab = ({ year }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStudentsData, setNewStudentsData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    matriculaEn: String(year),
    peroNoEn: String(year - 1)
  });
  const [detailedStudents, setDetailedStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await adminStudentService.getNewStudentsReport(year);
        setNewStudentsData(data);
      } catch (err) {
        setError("No se pudieron cargar los datos de estudiantes nuevos. Intente nuevamente.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const detailedData = await adminStudentService.getDetailedNewStudents({
        ...filters,
        year
      });
      setDetailedStudents(detailedData);
      setShowDetails(true);
    } catch (err) {
      console.error("Error al aplicar filtros:", err);
      setError("No se pudieron aplicar los filtros. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromDetails = () => {
    setShowDetails(false);
  };

  // Datos simulados para desarrollo
  const mockData = [
    {
      id: 1,
      name: "Grado Cuarto",
      level: "Primaria",
      nuevos: 0
    },
    {
      id: 2,
      name: "Grado Quinto",
      level: "Primaria",
      nuevos: 3
    }
  ];

  // Datos simulados para detalle de estudiantes
  const mockDetailedStudents = [
    {
      id: 106,
      codigo: 106,
      nombre: "Álvarez Ardila",
      matricula: "Primaria",
      estado: "Activo"
    },
    {
      id: 293,
      codigo: 293,
      nombre: "Rodríguez Pérez",
      matricula: "Párvulos",
      estado: "Activo"
    },
    {
      id: 181,
      codigo: 181,
      nombre: "Martínez López",
      matricula: "Párvulos",
      estado: "Activo"
    },
    {
      id: 20,
      codigo: 20,
      nombre: "Sánchez Torres",
      matricula: "Primaria",
      estado: "Activo"
    },
    {
      id: 287,
      codigo: 287,
      nombre: "González Herrera",
      matricula: "Primaria",
      estado: "Activo"
    },
    {
      id: 7,
      codigo: 7,
      nombre: "Patiño Jiménez",
      matricula: "Párvulos",
      estado: "Activo"
    },
    {
      id: 11,
      codigo: 11,
      nombre: "Muñoz Castañeda",
      matricula: "Primaria",
      estado: "Activo"
    },
    {
      id: 155,
      codigo: 155,
      nombre: "Rojas Cárdenas",
      matricula: "Párvulos",
      estado: "Activo"
    },
    {
      id: 130,
      codigo: 130,
      nombre: "Ospina Valencia",
      matricula: "Párvulos",
      estado: "Activo"
    }
  ];

  const data = newStudentsData.length > 0 ? newStudentsData : mockData;
  
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

  if (showDetails) {
    return (
      <NewStudentsDetail
        students={detailedStudents.length > 0 ? detailedStudents : mockDetailedStudents} 
        onBack={handleBackFromDetails}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reporte Nuevos</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-primary hover:text-primary-dark"
        >
          <Filter className="h-4 w-4 mr-1" />
          <span>Filtrar estudiantes</span>
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 p-4 rounded-lg mb-6"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-3">Mostrar estudiantes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Con matrícula en</label>
              <select
                name="matriculaEn"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                value={filters.matriculaEn}
                onChange={handleFilterChange}
              >
                {[year, year-1, year-2].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Pero no en</label>
              <select
                name="peroNoEn"
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                value={filters.peroNoEn}
                onChange={handleFilterChange}
              >
                {[year, year-1, year-2].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={applyFilters}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Aceptar
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {data.map((grade, index) => (
          <motion.div
            key={grade.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{grade.name}</h3>
                <p className="text-sm text-gray-500">{grade.level}</p>
              </div>
              <div className="flex items-center">
                <div className={`px-4 py-2 rounded-full ${grade.nuevos > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  <span className="font-semibold">{grade.nuevos}</span>
                </div>
                <div className="ml-4 w-32 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${grade.nuevos > 0 ? 'bg-blue-500' : 'bg-gray-400'}`}
                    style={{width: `${Math.min(100, (grade.nuevos / 10) * 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={applyFilters}
          className="flex items-center bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          <span>Ver detalle de estudiantes nuevos</span>
        </button>
      </div>
    </div>
  );
};

export default NewStudentsTab;
