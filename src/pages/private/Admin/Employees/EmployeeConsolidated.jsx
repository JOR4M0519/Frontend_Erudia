// src/components/admin/teachers/EmployeeConsolidated.jsx

import React, { useState, useEffect } from "react";
import { ChevronLeft, Search, User, Shield, Mail, CheckCircle, XCircle, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AdminRoutes } from "../../../../models";
import Swal from "sweetalert2";
import { AddEmployee, userService, employeeService } from "./";
import EmployeeDetailModal from "./EmployeeDetailModal";

const EmployeeConsolidated = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [idTypes, setIdTypes] = useState([]);
  const [roles, setRoles] = useState([]); // Añadimos estado para roles
  const [editedUserData, setEditedUserData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAdministrativeUsers();
        setUsers(data);
        setFilteredUsers(data);
        setError(null);
      } catch (err) {
        setError("No se pudieron cargar los datos de usuarios administrativos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchIdTypes = async () => {
      try {
        const types = await userService.getIdTypes();
        setIdTypes(types);
      } catch (err) {
        console.error("Error al cargar tipos de identificación:", err);
      }
    };

    const fetchRoles = async () => {
      try {
        const rolesData = await employeeService.getRoles();
        setRoles(rolesData);
      } catch (err) {
        console.error("Error al cargar roles:", err);
      }
    };

    fetchUsers();
    fetchIdTypes();
    fetchRoles(); // Cargamos los roles
  }, []);

  useEffect(() => {
    // Aplicar filtros
    let result = [...users];

    // Filtrar por estado
    if (statusFilter !== "all") {
      result = result.filter(user => user.status === statusFilter);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(result);
  }, [users, statusFilter, searchTerm]);

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'A' ? 'I' : 'A';
    const statusText = newStatus === 'A' ? 'activar' : 'desactivar';

    try {
      const result = await Swal.fire({
        title: `¿Está seguro de ${statusText} este usuario?`,
        text: `El usuario cambiará su estado a ${newStatus === 'A' ? 'Activo' : 'Inactivo'}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await userService.updateUserStatus(id, newStatus);

        // Actualizar estado local
        setUsers(users.map(user =>
          user.id === id ? { ...user, status: newStatus } : user
        ));

        Swal.fire(
          '¡Actualizado!',
          `El usuario ha sido ${newStatus === 'A' ? 'activado' : 'desactivado'} correctamente.`,
          'success'
        );
      }
    } catch (err) {
      Swal.fire(
        'Error',
        'No se pudo actualizar el estado del usuario',
        'error'
      );
      console.error(err);
    }
  };

  // Función para recargar los usuarios después de crear uno nuevo
  const handleUserCreated = async () => {
    try {
      setLoading(true);
      const data = await userService.getAdministrativeUsers();
      setUsers(data);
      setFilteredUsers(data);
      setError(null);
    } catch (err) {
      setError("No se pudieron recargar los datos de usuarios administrativos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (userId) => {
    try {
      setDetailLoading(true);
      setIsModalOpen(true);
  
      const detail = await userService.getUserDetail(userId);
      setSelectedUser(detail.user);
      setUserDetail(detail);
  
      // Extraer los IDs de roles del usuario para la edición
      // Verificamos si roles existe antes de hacer map
      const userRoleIds = detail.user.roles ? detail.user.roles.map(role => role.id) : [];  

      // Inicializar datos para edición
      setEditedUserData({
        user: {
          id: detail.user.id,
          firstName: detail.user.firstName,
          lastName: detail.user.lastName,
          email: detail.user.email,
          username: detail.user.username,
          status: detail.user.status,
          roles: userRoleIds // Ahora será un array vacío si roles es null
        },
        userDetail: {
          id: detail.id,
          firstName: detail.firstName,
          middleName: detail.middleName || "",
          lastName: detail.lastName,
          secondLastName: detail.secondLastName || "",
          address: detail.address,
          phoneNumber: detail.phoneNumber,
          dateOfBirth: detail.dateOfBirth,
          dni: detail.dni,
          idTypeId: detail.idType?.id,
          neighborhood: detail.neighborhood,
          city: detail.city,
          positionJob: detail.positionJob
        }
      });
  
      setIsEditing(false);
      setDetailLoading(false);
    } catch (err) {
      console.error("Error al cargar detalles del usuario:", err);
      Swal.fire(
        'Error',
        'No se pudieron cargar los detalles del usuario',
        'error'
      );
      setIsModalOpen(false);
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUserDetail(null);
    setEditedUserData(null);
    setIsEditing(false);
  };

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;

    setEditedUserData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  // Manejador para cambios en los roles
  const handleRoleChange = (e) => {
    const roleId = parseInt(e.target.value);
    const isChecked = e.target.checked;
    
    setEditedUserData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        roles: isChecked 
          ? [...prev.user.roles, roleId]
          : prev.user.roles.filter(id => id !== roleId)
      }
    }));
  };

  const handleSaveChanges = async () => {
    try {
      Swal.fire({
        title: 'Guardando cambios',
        text: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Preparar datos para enviar
      const updateData = {
        user: {
          ...editedUserData.user
        },
        userDetail: {
          ...editedUserData.userDetail,
          userId: selectedUser.id
        }
      };

      await userService.updateUserFull(selectedUser.id, updateData);

      // Actualizar la lista de usuarios
      const updatedUsers = await userService.getAdministrativeUsers();
      setUsers(updatedUsers);

      Swal.fire(
        '¡Guardado!',
        'Los cambios han sido guardados correctamente.',
        'success'
      );

      setIsEditing(false);
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      Swal.fire(
        'Error',
        'No se pudieron guardar los cambios',
        'error'
      );
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(AdminRoutes.DASHBOARD)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Personal Administrativo</h1>
              <p className="mt-1 text-sm text-gray-500">Gestiona la información de todos los usuarios administrativos de la institución</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, usuario o email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">

            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <User className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </button>

              {(statusFilter !== "all" || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </button>
              )}
            </div>
          </div>
          {/* Panel de filtros desplegable */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      id="status-filter"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Todos</option>
                      <option value="A">Activos</option>
                      <option value="I">Inactivos</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <span className="ml-3 text-gray-700 font-medium">Cargando usuarios...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron usuarios</h3>
            <p className="text-gray-500">Intenta con otros filtros de búsqueda</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(user.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.status === 'A' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircle className="h-4 w-4 mr-1" /> Activo
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            <XCircle className="h-4 w-4 mr-1" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(user.id, user.status);
                          }}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${user.status === 'A'
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                        >
                          {user.status === 'A' ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <AddEmployee
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleUserCreated}
      />

      {/* Modal de detalles del empleado */}
      <EmployeeDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userDetail={userDetail}
        selectedUser={selectedUser}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editedUserData={editedUserData}
        handleInputChange={handleInputChange}
        handleRoleChange={handleRoleChange} // Añadimos el manejador de roles
        handleSaveChanges={handleSaveChanges}
        idTypes={idTypes}
        roles={roles} // Pasamos los roles al modal
        detailLoading={detailLoading}
      />
    </main>
  );
};

export default EmployeeConsolidated;
