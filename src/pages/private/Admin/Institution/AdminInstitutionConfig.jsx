import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Save, Building, MapPin, Phone, Mail, User, Calendar, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { AdminRoutes } from "../../../../models";

const AdminInstitutionConfig = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutionData = async () => {
      setLoading(true);
      try {
        // Simulamos la llamada a la API (reemplazar con tu endpoint real)
        // const response = await axios.get("/api/institution");
        // const data = response.data;
        
        // Por ahora usamos datos de ejemplo
        const data = {
          name: "Colegio San Juan",
          nit: "901.234.567-8",
          email: "contacto@colegiosanjuan.edu.co",
          phone_number: "(+57) 601-2345678",
          address: "Calle 123 # 45-67",
          city: "Bogotá",
          department: "Cundinamarca",
          country: "Colombia",
          postal_code: "110111",
          legal_representative: "Ana María Rodríguez",
          incorporation_date: "1985-03-15",
          website: "www.colegiosanjuan.edu.co",
          mission: "Formar estudiantes íntegros con excelencia académica"
        };
        
        // Poblar el formulario con datos existentes
        Object.keys(data).forEach(key => {
          setValue(key, data[key]);
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("No se pudieron cargar los datos de la institución");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstitutionData();
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setSaved(false);
    try {
      // Simulamos el guardado (reemplazar con tu endpoint real)
      // await axios.put("/api/institution", data);
      
      // Simulamos un tiempo de espera
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSaved(true);
      toast.success("Configuración guardada exitosamente");
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar la configuración");
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
              onClick={() => navigate(AdminRoutes.INSTITUTION)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuración Institucional</h1>
              <p className="mt-1 text-sm text-gray-500">Gestiona los datos básicos de la institución</p>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        {loading && !saved ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            {saved && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border-l-4 border-green-400 p-4 m-6"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm leading-5 font-medium text-green-800">
                      Configuración guardada exitosamente
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-8">
                {/* Información básica */}
                <div>
                  <div className="flex items-center mb-4">
                    <Building className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-xl font-medium text-gray-900">Información Básica</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la institución
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered w-full ${errors.name ? 'border-red-500' : ''}`}
                        {...register("name", { required: "Este campo es obligatorio" })}
                      />
                      {errors.name && (
                        <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIT
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered w-full ${errors.nit ? 'border-red-500' : ''}`}
                        {...register("nit", { required: "Este campo es obligatorio" })}
                      />
                      {errors.nit && (
                        <span className="text-red-500 text-xs mt-1">{errors.nit.message}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sitio web
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        {...register("website")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de fundación
                      </label>
                      <div className="relative">
                        <Calendar className="h-5 w-5 text-gray-400 absolute top-2.5 left-3" />
                        <input
                          type="date"
                          className="input input-bordered w-full pl-10"
                          {...register("incorporation_date")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <div className="flex items-center mb-4">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-xl font-medium text-gray-900">Dirección</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección completa
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered w-full ${errors.address ? 'border-red-500' : ''}`}
                        {...register("address", { required: "Este campo es obligatorio" })}
                      />
                      {errors.address && (
                        <span className="text-red-500 text-xs mt-1">{errors.address.message}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        {...register("city")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        {...register("department")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        {...register("country")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código postal
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        {...register("postal_code")}
                      />
                    </div>
                  </div>
                </div>

                {/* Contacto */}
                <div>
                  <div className="flex items-center mb-4">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-xl font-medium text-gray-900">Contacto</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="h-5 w-5 text-gray-400 absolute top-2.5 left-3" />
                        <input
                          type="email"
                          className={`input input-bordered w-full pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          {...register("email", { 
                            required: "Este campo es obligatorio",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Dirección de email inválida"
                            }
                          })}
                        />
                      </div>
                      {errors.email && (
                        <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="h-5 w-5 text-gray-400 absolute top-2.5 left-3" />
                        <input
                          type="text"
                          className={`input input-bordered w-full pl-10 ${errors.phone_number ? 'border-red-500' : ''}`}
                          {...register("phone_number", { required: "Este campo es obligatorio" })}
                        />
                      </div>
                      {errors.phone_number && (
                        <span className="text-red-500 text-xs mt-1">{errors.phone_number.message}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Representante legal
                      </label>
                      <div className="relative">
                        <User className="h-5 w-5 text-gray-400 absolute top-2.5 left-3" />
                        <input
                          type="text"
                          className="input input-bordered w-full pl-10"
                          {...register("legal_representative")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <div className="flex items-center mb-4">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-xl font-medium text-gray-900">Descripción</h2>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Misión institucional
                    </label>
                    <textarea
                      rows={4}
                      className="input input-bordered w-full h-auto py-2"
                      {...register("mission")}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/admin/institucion")}
                  className="btn btn-ghost mr-3"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex items-center"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar cambios
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </section>
    </main>
  );
};

export default AdminInstitutionConfig;
