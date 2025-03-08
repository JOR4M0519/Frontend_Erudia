import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { employeeService } from "./employeeService";
import { AdminRoutes } from "../../../../models";


const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    documento: "",
    nombre: "",
    apellidos: "",
    sexo: "Masculino",
    fechaNacimiento: "",
    paisNacimiento: "Colombia",
    departamentoNacimiento: "",
    ciudadNacimiento: "",
    paisResidencia: "Colombia",
    departamentoResidencia: "",
    ciudadResidencia: "",
    direccion: "",
    telefono: "",
    email: "",
    cargo: "Docente",
    fechaIngreso: "",
    estado: "Activo"
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await employeeService.addEmployee(formData);
      setSuccess(true);
      
      // Resetear el formulario después de 2 segundos y navegar de vuelta
      setTimeout(() => {
        navigate('/admin/empleados/consolidado');
      }, 2000);
      
    } catch (err) {
      setError("Error al agregar el empleado. Verifique los datos e inténtelo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Agregar Empleado</h1>
              <p className="mt-1 text-sm text-gray-500">Ingresa la información del nuevo colaborador</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-6"
            onSubmit={handleSubmit}
          >
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                Empleado agregado correctamente. Redirigiendo...
              </div>
            )}
            
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Información personal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Lugar de nacimiento</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <input
                    type="text"
                    name="paisNacimiento"
                    value={formData.paisNacimiento}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <input
                    type="text"
                    name="departamentoNacimiento"
                    value={formData.departamentoNacimiento}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    name="ciudadNacimiento"
                    value={formData.ciudadNacimiento}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Información de contacto</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <input
                    type="text"
                    name="paisResidencia"
                    value={formData.paisResidencia}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <input
                    type="text"
                    name="departamentoResidencia"
                    value={formData.departamentoResidencia}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    name="ciudadResidencia"
                    value={formData.ciudadResidencia}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Información laboral</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <select
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Docente">Docente</option>
                    <option value="Auxiliar administrativo">Auxiliar administrativo</option>
                    <option value="Coordinador académico">Coordinador académico</option>
                    <option value="Rector">Rector</option>
                    <option value="Personal de apoyo">Personal de apoyo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de ingreso</label>
                  <input
                    type="date"
                    name="fechaIngreso"
                    value={formData.fechaIngreso}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Licencia">Licencia</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </motion.form>
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

export default AddEmployee;
