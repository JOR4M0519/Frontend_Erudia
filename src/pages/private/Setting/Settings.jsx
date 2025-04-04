import React, { useState } from "react";
import { ChevronLeft, Lock, Eye, EyeOff, Save, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { configViewService } from "./configViewService";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Obtener el usuario del Redux store
  const user = useSelector((state) => state.user);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const tabs = [
    { id: "password", label: "Administración de contraseña", icon: <Lock className="h-4 w-4 mr-2" /> },
    // Aquí puedes agregar más pestañas en el futuro
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
    
    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };
  

  
// Función para validar el formulario con las nuevas reglas de seguridad
const validateForm = () => {
  let valid = true;
  const newErrors = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  };
  
  // Validar contraseña actual
  if (!passwordForm.currentPassword.trim()) {
    newErrors.currentPassword = "La contraseña actual es requerida";
    valid = false;
  }
  
  // Validar nueva contraseña
  if (!passwordForm.newPassword.trim()) {
    newErrors.newPassword = "La nueva contraseña es requerida";
    valid = false;
  } else {
    // Verificar longitud mínima
    if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = "La contraseña debe tener al menos 8 caracteres";
      valid = false;
    }
    
    // Verificar si contiene al menos un número
    if (!/\d/.test(passwordForm.newPassword)) {
      newErrors.newPassword = newErrors.newPassword || "La contraseña debe incluir al menos un número";
      valid = false;
    }
    
    // Verificar si contiene al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(passwordForm.newPassword)) {
      newErrors.newPassword = newErrors.newPassword || "La contraseña debe incluir al menos un carácter especial";
      valid = false;
    }
  }
  
  // Validar confirmación de contraseña
  if (!passwordForm.confirmPassword.trim()) {
    newErrors.confirmPassword = "Debe confirmar la nueva contraseña";
    valid = false;
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    newErrors.confirmPassword = "Las contraseñas no coinciden";
    valid = false;
  }
  
  setErrors(newErrors);
  return valid;
};

  const resetForm = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Actualizado para usar lastPassword en lugar de password según el nuevo dominio
      const loginData = {
        lastPassword: passwordForm.currentPassword,
        password: passwordForm.newPassword
      };
      
      await configViewService.updateUserPassword(user.username, loginData);
      
      Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        text: 'Tu contraseña ha sido actualizada exitosamente.',
        confirmButtonColor: '#3b82f6',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
      
      // Limpiar formulario
      resetForm();
      
    } catch (error) {
      let errorMessage = "Ocurrió un error al actualizar la contraseña.";
      
      if (error.response) {
        // Si la respuesta contiene un mensaje de error específico
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        
        // Si la contraseña actual es incorrecta (código 401)
        if (error.response.status === 401) {
          setErrors({
            ...errors,
            currentPassword: "La contraseña actual es incorrecta"
          });
        }
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#ef4444',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para calcular la fortaleza de la contraseña
const calculatePasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) strength += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  
  return strength;
};

// Componente para mostrar la fortaleza de la contraseña
const PasswordStrengthIndicator = ({ password }) => {
  const strength = calculatePasswordStrength(password);
  
  let indicatorText = "";
  let indicatorColor = "";
  
  switch(strength) {
    case 0:
    case 1:
      indicatorText = "Débil";
      indicatorColor = "bg-red-500";
      break;
    case 2:
    case 3:
      indicatorText = "Media";
      indicatorColor = "bg-yellow-500";
      break;
    case 4:
    case 5:
      indicatorText = "Fuerte";
      indicatorColor = "bg-green-500";
      break;
    default:
      indicatorText = "";
      indicatorColor = "bg-gray-200";
  }
  
  return (
    <div className="mt-2">
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${indicatorColor}`} 
            style={{ width: `${(strength / 5) * 100}%` }}
          ></div>
        </div>
        <span className="ml-2 text-xs text-gray-600">{indicatorText}</span>
      </div>
    </div>
  );
};


  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
              <p className="mt-1 text-sm text-gray-500">Gestione su cuenta y preferencias personales</p>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-wrap text-sm font-medium text-center border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 p-4 transition-colors flex items-center justify-center ${
                  activeTab === tab.id
                    ? "bg-gray-100 text-primary border-b-2 border-primary"
                    : "hover:bg-gray-50 text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "password" && (
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Cambiar contraseña</h2>
                    <p className="text-gray-600 text-sm">
                      Actualiza tu contraseña para mantener tu cuenta segura. La contraseña debe tener al menos 8 caracteres.
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Contraseña actual
                      </label>
                      <div className="relative">
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña actual"
                          value={passwordForm.currentPassword}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                            errors.currentPassword ? "border-red-500 focus:ring-red-300" : "border-gray-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-red-500 text-sm">{errors.currentPassword}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
    Nueva contraseña
  </label>
  <div className="relative">
    <input
      id="newPassword"
      name="newPassword"
      type={showNewPassword ? "text" : "password"}
      placeholder="Ingresa tu nueva contraseña"
      value={passwordForm.newPassword}
      onChange={handleInputChange}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 ${
        errors.newPassword ? "border-red-500 focus:ring-red-300" : "border-gray-300"
      }`}
    />
    <button
      type="button"
      onClick={() => setShowNewPassword(!showNewPassword)}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
    >
      {showNewPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  </div>
  
  {passwordForm.newPassword && <PasswordStrengthIndicator password={passwordForm.newPassword} />}
  
  {errors.newPassword && (
    <p className="text-red-500 text-sm">{errors.newPassword}</p>
  )}
  
  <p className="text-xs text-gray-500 mt-1">
    La contraseña debe tener al menos 8 caracteres, incluir un número y un carácter especial.
  </p>
</div>

                    
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirmar nueva contraseña
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirma tu nueva contraseña"
                          value={passwordForm.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                            errors.confirmPassword ? "border-red-500 focus:ring-red-300" : "border-gray-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                      )}
                    </div>
                    
                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 flex justify-center items-center px-4 py-2 bg-red-400 text-white rounded-md
                         hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        <span>Cancelar</span>
                      </button>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 flex justify-center items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Actualizando...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            <span>Guardar cambios</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Settings;
