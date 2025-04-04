// src/components/admin/teachers/EmployeeDetailModal.jsx

import React from "react";
import { X, Save, Edit, User, Mail, Calendar, Phone, MapPin, Briefcase, Shield, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

const EmployeeDetailModal = ({
  isOpen,
  onClose,
  userDetail,
  selectedUser,
  isEditing,
  setIsEditing,
  editedUserData,
  handleInputChange,
  handleSaveChanges,
  handleRoleChange,
  idTypes,
  roles,
  detailLoading
}) => {
  if (!isOpen) return null;

  // Evitar renderizar contenido si no hay datos
  if (detailLoading) {
    return (
      <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
            <span className="ml-3 text-gray-700 font-medium">Cargando información...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedUser || !userDetail || !editedUserData) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 z-50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-800">Detalles del Empleado</h2>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
            ) : (
              <button
                onClick={handleSaveChanges}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </button>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
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
                    Nombre de Usuario
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={editedUserData.user.username}
                      onChange={(e) => handleInputChange(e, "user")}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{selectedUser.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editedUserData.user.email}
                        onChange={(e) => handleInputChange(e, "user")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">{selectedUser.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    {isEditing ? (
                      <select
                        name="status"
                        value={editedUserData.user.status}
                        onChange={(e) => handleInputChange(e, "user")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="A">Activo</option>
                        <option value="I">Inactivo</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUser.status === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.status === 'A' ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nueva sección para mostrar roles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roles
                  </label>
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                    {isEditing && roles && roles.length > 0 ? (
                      <div className="space-y-2">
                        {roles.map(role => (
                          <div key={role.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`role-${role.id}`}
                              value={role.id}
                              checked={editedUserData.user.roles.includes(role.id)}
                              onChange={handleRoleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`role-${role.id}`} className="ml-2 block text-sm text-gray-900">
                              {role.roleName}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {selectedUser.roles && selectedUser.roles.length > 0 ? (
                          selectedUser.roles.map(role => (
                            <span 
                              key={role.id} 
                              className="inline-flex items-center mr-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {role.role.roleName}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">Sin roles asignados</p>
                        )}
                      </div>
                    )}
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
                      Primer Nombre
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={editedUserData.userDetail.firstName}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">{userDetail.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Segundo Nombre
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="middleName"
                        value={editedUserData.userDetail.middleName || ""}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">{userDetail.middleName || "-"}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primer Apellido
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={editedUserData.userDetail.lastName}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">{userDetail.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Segundo Apellido
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="secondLastName"
                        value={editedUserData.userDetail.secondLastName || ""}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">{userDetail.secondLastName || "-"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editedUserData.userDetail.dateOfBirth || ""}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {userDetail.dateOfBirth ? new Date(userDetail.dateOfBirth).toLocaleDateString() : "-"}
                      </p>
                    )}
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
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={editedUserData.userDetail.phoneNumber || ""}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">{userDetail.phoneNumber || "-"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={editedUserData.userDetail.address || ""}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">{userDetail.address || "-"}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barrio
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="neighborhood"
                        value={editedUserData.userDetail.neighborhood || ""}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">{userDetail.neighborhood || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={editedUserData.userDetail.city || ""}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">{userDetail.city || "-"}</p>
                    )}
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
                      Tipo de Documento
                    </label>
                    {isEditing ? (
                      <select
                        name="idTypeId"
                        value={editedUserData.userDetail.idTypeId || ""}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Seleccionar...</option>
                        {idTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{userDetail.idType?.name || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Documento
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="dni"
                        value={editedUserData.userDetail.dni || ""}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">{userDetail.dni || "-"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="positionJob"
                        value={editedUserData.userDetail.positionJob || ""}
                        onChange={(e) => handleInputChange(e, "userDetail")}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-gray-900">{userDetail.positionJob || "-"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeDetailModal;
