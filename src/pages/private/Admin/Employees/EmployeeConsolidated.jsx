import React, { useState, useEffect } from "react";
import { ChevronLeft, X, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { employeeService } from "./employeeService";
import { AdminRoutes } from "../../../../models";


const EmployeeConsolidated = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await employeeService.getEmployeeConsolidated(year);
        setEmployees(data);
        setError(null);
      } catch (err) {
        setError("No se pudieron cargar los datos de empleados");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, [year]);

  // Agrupar empleados por cargo
  const employeesByRole = employees.reduce((acc, employee) => {
    if (!acc[employee.cargo]) {
      acc[employee.cargo] = [];
    }
    acc[employee.cargo].push(employee);
    return acc;
  }, {});

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este empleado?")) {
      try {
        await employeeService.deleteEmployee(id);
        setEmployees(employees.filter(emp => emp.id !== id));
      } catch (err) {
        setError("Error al eliminar el empleado");
        console.error(err);
      }
    }
  };

  const handleEditContact = (id) => {
    navigate(`/admin/empleados/editar/${id}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(AdminRoutes.EMPLOYEES)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Consolidado de empleados</h1>
              <p className="mt-1 text-sm text-gray-500">Gestiona la información de todos los colaboradores de la institución</p>
            </div>
            <div className="flex items-center">
              <label htmlFor="year" className="mr-2 text-sm text-gray-600">Año escolar:</label>
              <select 
                id="year"
                className="form-select rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-primary focus:border-primary"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {[...Array(5)].map((_, i) => {
                  const yearOption = new Date().getFullYear() - 2 + i;
                  return <option key={yearOption} value={yearOption}>{yearOption}</option>;
                })}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="flex justify-between mb-6">
              <div className="grid grid-cols-2 gap-y-2 gap-x-8">
                <div>
                  <span className="font-medium text-gray-700">Año escolar</span>
                  <div className="text-gray-900">{year}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Grupos</span>
                  <div className="text-gray-900">12</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total</span>
                  <div className="text-gray-900">{employees.length} colaboradores</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800">Consolidado</div>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
              <>
                {Object.entries(employeesByRole).map(([role, roleEmployees]) => (
                  <div key={role} className="mb-8">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">{role}</h2>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y divide-gray-200">
                          {roleEmployees.map((employee) => (
                            <tr key={employee.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {employee.nombre} {employee.apellidos}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {employee.estado}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {employee.telefono}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  onClick={() => handleEditContact(employee.id)}
                                  className="text-gray-400 hover:text-gray-600 mr-2"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Sistema de Gestión Educativa
            </div>
            <div className="mt-2 md:mt-0 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-700">Ayuda</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default EmployeeConsolidated;
