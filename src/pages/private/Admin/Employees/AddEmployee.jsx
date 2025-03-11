import React, { useState, useEffect } from "react";
import { X, Save, User, Mail, Calendar, Phone, MapPin, Briefcase, Shield, Key, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { employeeService } from "./EmployeeService";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminRoutes } from "../../../../models";

const AddEmployee = ({ isOpen, onClose, onSuccess, section }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = section === "add"; // Check if component is used as standalone page
  
  const [loading, setLoading] = useState(false);
  const [idTypes, setIdTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  
  const [formData, setFormData] = useState({
    user: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      status: "A",
      roles: []
    },
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    address: "",
    phoneNumber: "",
    dateOfBirth: "",
    dni: "",
    idTypeId: "",
    neighborhood: "",
    city: "",
    positionJob: ""
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [idTypesData, rolesData] = await Promise.all([
          employeeService.getIdTypes(),
          employeeService.getRoles()
        ]);
        
        setIdTypes(idTypesData);
        setRoles(rolesData);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        Swal.fire('Error', 'No se pudieron cargar los datos necesarios', 'error');
      }
    };

    // If modal is open or component is used as standalone page
    if (isOpen || isStandalone) {
      fetchInitialData();
    }
  }, [isOpen, isStandalone]);

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    
    if (section) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleRoleChange = (e) => {
    const roleId = parseInt(e.target.value);
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setFormData({
        ...formData,
        user: {
          ...formData.user,
          roles: [...formData.user.roles, roleId]
        }
      });
    } else {
      setFormData({
        ...formData,
        user: {
          ...formData.user,
          roles: formData.user.roles.filter(id => id !== roleId)
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.user.username || !formData.user.email || !formData.user.password) {
      Swal.fire('Error', 'Los campos de usuario, email y contraseña son obligatorios', 'error');
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      Swal.fire('Error', 'Los campos de nombre y apellido son obligatorios', 'error');
      return;
    }

    if (!formData.dni || !formData.idTypeId) {
      Swal.fire('Error', 'El documento de identidad y su tipo son obligatorios', 'error');
      return;
    }

    if (formData.user.roles.length === 0) {
      Swal.fire('Error', 'Debe seleccionar al menos un rol para el usuario', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Sincronizar nombres entre user y userDetail
      const dataToSend = {
        ...formData,
        user: {
          ...formData.user,
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      };
      
      await employeeService.createAdministrativeUser(dataToSend);
      
      Swal.fire('¡Éxito!', 'Usuario administrativo creado correctamente', 'success');
      setFormData({
        user: {
          username: "",
          email: "",
          firstName: "",
          lastName: "",
          password: "",
          status: "A",
          roles: []
        },
        firstName: "",
        middleName: "",
        lastName: "",
        secondLastName: "",
        address: "",
        phoneNumber: "",
        dateOfBirth: "",
        dni: "",
        idTypeId: "",
        neighborhood: "",
        city: "",
        positionJob: ""
      });
      
      if (isStandalone) {
        // Navigate back to the consolidated view if in standalone mode
        navigate(AdminRoutes.EMPLOYEES_CONSOLIDATED);
      } else {
        // Call onSuccess and close modal if in modal mode
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      Swal.fire('Error', 'No se pudo crear el usuario administrativo', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Render the form content (used in both modal and standalone)
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información de Usuario */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            Información de Cuenta
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                name="username"
                value={formData.user.username}
                onChange={(e) => handleInputChange(e, "user")}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico *
              </label>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="email"
                  name="email"
                  value={formData.user.email}
                  onChange={(e) => handleInputChange(e, "user")}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <div className="flex items-center">
                <Key className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="password"
                  name="password"
                  value={formData.user.password}
                  onChange={(e) => handleInputChange(e, "user")}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-gray-400 mr-2" />
                <select
                  name="status"
                  value={formData.user.status}
                  onChange={(e) => handleInputChange(e, "user")}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Información Personal */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información Personal
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primer Nombre *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segundo Nombre
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primer Apellido *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segundo Apellido
                </label>
                <input
                  type="text"
                  name="secondLastName"
                  value={formData.secondLastName}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información de Contacto
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barrio
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Información de Identificación y Trabajo */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Identificación y Cargo
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento *
                </label>
                <select
                  name="idTypeId"
                  value={formData.idTypeId}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {idTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  name="positionJob"
                  value={formData.positionJob}
                  onChange={(e) => handleInputChange(e)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roles *
              </label>
              <div className="mt-2 space-y-2">
                {roles.map(role => (
                  <div key={role.id} className="flex items-center">
                    <input
                      id={`role-${role.id}`}
                      name={`role-${role.id}`}
                      type="checkbox"
                      value={role.id}
                      checked={formData.user.roles.includes(role.id)}
                      onChange={handleRoleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`role-${role.id}`} className="ml-2 block text-sm text-gray-900">
                      {role.roleName}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con botones */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={isStandalone ? () => navigate(AdminRoutes.EMPLOYEES_CONSOLIDATED) : onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Crear Usuario
        </button>
      </div>
    </form>
  );

  // If used as a modal and not open, return null
  if (!isStandalone && !isOpen) return null;

  // If used as a standalone page
  if (isStandalone) {
    return (
      <main className="min-h-screen bg-gray-50 pb-10">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => navigate(AdminRoutes.EMPLOYEES_CONSOLIDATED)}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Usuario Administrativo</h1>
                <p className="mt-1 text-sm text-gray-500">Ingrese la información para crear un nuevo usuario en el sistema</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-lg shadow">
            {renderForm()}
          </div>
        </div>
      </main>
    );
  }

  // If used as a modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-800">Crear Nuevo Usuario Administrativo</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {renderForm()}
      </motion.div>
    </div>
  );
};

export default AddEmployee;