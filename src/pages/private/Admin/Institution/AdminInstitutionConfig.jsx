import { useState, useEffect } from "react";
import { Settings, FileText, School, Users, Book, Save, Edit, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { institutionService } from "./institutionService";
import { Institution, defaultInstitution } from "./models/Institution.model";
import Swal from "sweetalert2";

const AdminInstitution = () => {
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(defaultInstitution);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(defaultInstitution);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchInstitutionData();
  }, []);
  
  const fetchInstitutionData = async () => {
    try {
      setIsLoading(true);
      const data = await institutionService.getInstitutions();
      const institutionData = Institution.fromBackend(data);
      setInstitution(institutionData);
      setFormData(institutionData);
      setError(null);
    } catch (err) {
      console.error("Error fetching institution data:", err);
      setError("No se pudo cargar la información de la institución");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => new Institution({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      // Convertir a formato backend antes de enviar
      await institutionService.updateInstitution(formData);
      await fetchInstitutionData();
      setIsEditing(false);
      
      Swal.fire({
        icon: "success",
        title: "¡Datos actualizados!",
        text: "La información de la institución se ha actualizado correctamente.",
        confirmButtonColor: "#3085d6"
      });
      
    } catch (err) {
      console.error("Error updating institution:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la información. Por favor, intente de nuevo.",
        confirmButtonColor: "#3085d6"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setFormData(institution);
    setIsEditing(false);
  };
  
  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administración Institucional</h1>
            <p className="mt-1 text-sm text-gray-500">Gestiona todos los aspectos relacionados con tu institución educativa</p>
          </div>
          <School className="h-12 w-12 text-primary" />
        </div>
      </header>
      
      <section className="w-full max-w-[2000px] mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        {/* Información de la institución */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {isLoading ? "Cargando..." : `${formData.name || "Información de la Institución"}`}
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4" />
                  Editar información
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md text-red-600">
                <p>{error}</p>
                <button 
                  onClick={fetchInstitutionData}
                  className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Código (no editable) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código
                    </label>
                    <input
                      type="text"
                      value={formData.id || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">El código de la institución no es editable</p>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la institución
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md transition-all duration-200 ${
                        isEditing 
                          ? "border-gray-300 shadow-md focus:ring-2 focus:ring-primary focus:border-primary" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  {/* NIT */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIT
                    </label>
                    <input
                      type="text"
                      name="nit"
                      value={formData.nit || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md transition-all duration-200 ${
                        isEditing 
                          ? "border-gray-300 shadow-md focus:ring-2 focus:ring-primary focus:border-primary" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md transition-all duration-200 ${
                        isEditing 
                          ? "border-gray-300 shadow-md focus:ring-2 focus:ring-primary focus:border-primary" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md transition-all duration-200 ${
                        isEditing 
                          ? "border-gray-300 shadow-md focus:ring-2 focus:ring-primary focus:border-primary" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  {/* Dirección */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md transition-all duration-200 ${
                        isEditing 
                          ? "border-gray-300 shadow-md focus:ring-2 focus:ring-primary focus:border-primary" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  {/* Ciudad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md transition-all duration-200 ${
                        isEditing 
                          ? "border-gray-300 shadow-md focus:ring-2 focus:ring-primary focus:border-primary" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  {/* Departamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md transition-all duration-200 ${
                        isEditing 
                          ? "border-gray-300 shadow-md focus:ring-2 focus:ring-primary focus:border-primary" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  {/* País */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      País
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md transition-all duration-200 ${
                        isEditing 
                          ? "border-gray-300 shadow-md focus:ring-2 focus:ring-primary focus:border-primary" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  {/* Código postal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código postal
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md transition-all duration-200 ${
                        isEditing 
                          ? "border-gray-300 shadow-md focus:ring-2 focus:ring-primary focus:border-primary" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  {/* Representante legal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Representante legal
                    </label>
                    <input
                      type="text"
                      name="legalRepresentative"
                      value={formData.legalRepresentative || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md transition-all duration-200 ${
                        isEditing 
                          ? "border-gray-300 shadow-md focus:ring-2 focus:ring-primary focus:border-primary" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  {/* Fecha de constitución */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de constitución
                    </label>
                    <input
                      type="date"
                      name="incorporationDate"
                      value={formData.incorporationDate || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md transition-all duration-200 ${
                        isEditing 
                          ? "border-gray-300 shadow-md focus:ring-2 focus:ring-primary focus:border-primary" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>
                
                
              </form>
            )}
          </div>
        </motion.div>
      </section>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Sistema de Gestión Educativa
            </div>
            <div className="mt-2 md:mt-0 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-700">Ayuda</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Términos</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default AdminInstitution;
