// Corrección del componente SystemUsers.jsx

import React, { useState, useEffect } from "react";
import { 
  Users, Search, Filter, UserPlus, Edit, Trash2, X, 
  ChevronRight, ChevronLeft, Plus, Eye, ArrowRight, Save,
  AlertCircle, Check, RefreshCw
} from "lucide-react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { systemService } from "../systemService";

const SystemUsers = () => {
  // Estados principales
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("todos");
  const [availableRoles, setAvailableRoles] = useState([]);
  
  // Estados para modales
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [showRelationTypeModal, setShowRelationTypeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Estados para gestión de relaciones
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [newRelationshipType, setNewRelationshipType] = useState("");
  const [selectedRelationshipType, setSelectedRelationshipType] = useState(null);
  const [sourceUsers, setSourceUsers] = useState([]);
  const [targetUsers, setTargetUsers] = useState([]);
  const [selectedSourceUsers, setSelectedSourceUsers] = useState([]);
  const [selectedTargetUsers, setSelectedTargetUsers] = useState([]);
  
  // Estado para búsqueda en listas de usuarios
  const [sourceSearchTerm, setSourceSearchTerm] = useState("");
  const [filteredSourceUsers, setFilteredSourceUsers] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Obtener todos los usuarios con sus relaciones
        const usersData = await systemService.getAllFamilyRelations();
        setUsers(usersData);
        setFilteredUsers(usersData);
        
        // Extraer roles disponibles
        const roles = new Set();
        usersData.forEach(userData => {
          if (userData.userDetail.user.roles) {
            userData.userDetail.user.roles.forEach(roleData => {
              roles.add(roleData.role.roleName);
            });
          }
        });
        setAvailableRoles(["todos", ...Array.from(roles)]);
        
        // Obtener tipos de relaciones
        await fetchRelationshipTypes();
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos de usuarios',
          confirmButtonColor: '#3085d6'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Obtener tipos de relaciones
  const fetchRelationshipTypes = async () => {
    try {
      // Corregido para usar el método correcto
      const relationTypes = await systemService.getAllFamilyRelationTypes();
      setRelationshipTypes(relationTypes);
      if (relationTypes.length > 0) {
        setSelectedRelationshipType(relationTypes[0].id);
      }
    } catch (error) {
      console.error("Error al obtener tipos de relaciones:", error);
    }
  };

  // Filtrar usuarios
  useEffect(() => {
    let result = users;
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.userDetail.firstName && user.userDetail.firstName.toLowerCase().includes(term)) || 
        (user.userDetail.lastName && user.userDetail.lastName.toLowerCase().includes(term)) || 
        (user.userDetail.user.username && user.userDetail.user.username.toLowerCase().includes(term)) ||
        (user.userDetail.user.email && user.userDetail.user.email.toLowerCase().includes(term))
      );
    }
    
    // Filtrar por rol
    if (selectedRole !== "todos") {
      result = result.filter(user => 
        user.userDetail.user.roles && 
        user.userDetail.user.roles.some(role => 
          role.role.roleName.toLowerCase() === selectedRole.toLowerCase()
        )
      );
    }
    
    setFilteredUsers(result);
  }, [searchTerm, selectedRole, users]);

  // Filtrar usuarios en el modal de selección
  useEffect(() => {
    if (sourceSearchTerm) {
      const term = sourceSearchTerm.toLowerCase();
      const filtered = sourceUsers.filter(user => 
        (user.userDetail.firstName && user.userDetail.firstName.toLowerCase().includes(term)) || 
        (user.userDetail.lastName && user.userDetail.lastName.toLowerCase().includes(term)) || 
        (user.userDetail.user.email && user.userDetail.user.email.toLowerCase().includes(term))
      );
      setFilteredSourceUsers(filtered);
    } else {
      setFilteredSourceUsers(sourceUsers);
    }
  }, [sourceSearchTerm, sourceUsers]);

  // Preparar datos para el modal de relaciones
  const prepareRelationshipModal = () => {
    // Si hay un usuario seleccionado, filtrar para no incluirlo en la lista de origen
    const usersToShow = selectedUser 
      ? users.filter(user => user.userDetail.id !== selectedUser.userDetail.id)
      : [...users];
    
    setSourceUsers(usersToShow);
    setFilteredSourceUsers(usersToShow);
    setTargetUsers([]);
    setSelectedSourceUsers([]);
    setSelectedTargetUsers([]);
    setSourceSearchTerm("");
    setShowRelationshipModal(true);
  };

  // Mover usuarios seleccionados de izquierda a derecha
  const moveToTarget = (e) => {
    if (e) e.stopPropagation();
    if (selectedSourceUsers.length === 0) return;
    
    const newSourceUsers = sourceUsers.filter(
      user => !selectedSourceUsers.includes(user.userDetail.id)
    );
    
    const usersToMove = sourceUsers.filter(
      user => selectedSourceUsers.includes(user.userDetail.id)
    );
    
    setSourceUsers(newSourceUsers);
    setFilteredSourceUsers(newSourceUsers);
    setTargetUsers([...targetUsers, ...usersToMove]);
    setSelectedSourceUsers([]);
  };

  // Mover usuarios seleccionados de derecha a izquierda
  const moveToSource = (e) => {
    if (e) e.stopPropagation();
    if (selectedTargetUsers.length === 0) return;
    
    const newTargetUsers = targetUsers.filter(
      user => !selectedTargetUsers.includes(user.userDetail.id)
    );
    
    const usersToMove = targetUsers.filter(
      user => selectedTargetUsers.includes(user.userDetail.id)
    );
    
    setTargetUsers(newTargetUsers);
    setSourceUsers([...sourceUsers, ...usersToMove]);
    setFilteredSourceUsers([...sourceUsers, ...usersToMove]);
    setSelectedTargetUsers([]);
  };

  // Crear nuevas relaciones familiares
  const createFamilyRelations = async (e) => {
    if (e) e.stopPropagation();
    if (!selectedUser || targetUsers.length === 0 || !selectedRelationshipType) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Seleccione un usuario, al menos un familiar y un tipo de relación',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {
      const relationData = {
        userDetail: {
          id: selectedUser.userDetail.id
        },
        familyRelations: targetUsers.map(target => ({
          relativeUser: {
            id: target.userDetail.user.id
          },
          user: {
            id: selectedUser.userDetail.user.id
          },
          relationship: {
            id: selectedRelationshipType
          }
        })),
        isStudent: selectedUser.student
      };

      await systemService.createFamilyRelations(relationData);
      
      Swal.fire({
        icon: 'success',
        title: 'Relaciones creadas',
        text: 'Las relaciones familiares han sido creadas exitosamente',
        confirmButtonColor: '#3085d6'
      });
      
      // Recargar datos
      const usersData = await systemService.getAllFamilyRelations();
      setUsers(usersData);
      setFilteredUsers(usersData);
      setShowRelationshipModal(false);
      
    } catch (error) {
      console.error("Error al crear relaciones:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron crear las relaciones familiares',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  // Crear nuevo tipo de relación
  const createRelationshipType = async (e) => {
    if (e) e.stopPropagation();
    if (!newRelationshipType.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Ingrese un nombre para el tipo de relación',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {
      const relationTypeData = {
        relationshipType: newRelationshipType
      };
      
      // Corregido para usar el método correcto
      await systemService.createFamilyRelationsTypes(relationTypeData);
      await fetchRelationshipTypes();
      
      setNewRelationshipType("");
      setShowRelationTypeModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Tipo de relación creado',
        text: 'El nuevo tipo de relación ha sido creado exitosamente',
        confirmButtonColor: '#3085d6'
      });
      
    } catch (error) {
      console.error("Error al crear tipo de relación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el tipo de relación',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  // Eliminar relación familiar
  const deleteRelation = async (relationId, e) => {
    if (e) e.stopPropagation();
    try {
      await Swal.fire({
        title: '¿Está seguro?',
        text: "Esta acción eliminará la relación familiar",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await systemService.deleteFamilyRelation(relationId);
          
          // Recargar datos
          const usersData = await systemService.getAllFamilyRelations();
          setUsers(usersData);
          setFilteredUsers(usersData);
          
          if (selectedUser) {
            const updatedSelectedUser = usersData.find(
              user => user.userDetail.id === selectedUser.userDetail.id
            );
            setSelectedUser(updatedSelectedUser);
          }
          
          Swal.fire(
            '¡Eliminado!',
            'La relación ha sido eliminada.',
            'success'
          );
        }
      });
    } catch (error) {
      console.error("Error al eliminar relación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la relación',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  // Mostrar detalles de un usuario
  const showUserDetails = (user, e) => {
    if (e) e.stopPropagation();
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  // Cerrar todos los modales y limpiar estados
  const closeAllModals = (e) => {
    if (e) e.stopPropagation();
    setShowUserDetailsModal(false);
    setShowRelationshipModal(false);
    setShowRelationTypeModal(false);
    // Pequeño retraso para evitar problemas de renderizado
    setTimeout(() => {
      setSelectedUser(null);
      setTargetUsers([]);
      setSelectedSourceUsers([]);
      setSelectedTargetUsers([]);
    }, 300);
  };

  // Renderizar roles de un usuario
  const renderRoles = (roles) => {
    if (!roles || roles.length === 0) return "Sin roles";
    
    return roles.map(role => (
      <span 
        key={role.id || `role-${Math.random()}`} 
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1"
      >
        {role.role.roleName}
      </span>
    ));
  };

  // Renderizar el estado de un usuario
  const renderStatus = (status) => {
    const statusMap = {
      'A': { label: 'Activo', color: 'bg-green-100 text-green-800' },
      'I': { label: 'Inactivo', color: 'bg-red-100 text-red-800' },
      'P': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <main className="flex flex-col min-h-screen ">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios y Relaciones Familiares</h1>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prepareRelationshipModal();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Gestionar Relaciones
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Filtros y búsqueda */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  {availableRoles.map((role, index) => (
                    <option key={`role-option-${index}`} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-10">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-lg text-gray-600">Cargando usuarios...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col justify-center items-center p-10">
              <AlertCircle className="h-12 w-12 text-yellow-500 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">No se encontraron usuarios</h3>
              <p className="text-gray-500 mt-1">Intente con otros criterios de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Información
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userData) => (
                    <tr key={userData.userDetail.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {userData.userDetail.firstName?.charAt(0) || '?'}
                              {userData.userDetail.lastName?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userData.userDetail.firstName || ''} {userData.userDetail.lastName || ''}
                            </div>
                            <div className="text-sm text-gray-500">
                              {userData.userDetail.user.username || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{userData.userDetail.user.email || ''}</div>
                        <div className="text-sm text-gray-500">
                          {userData.userDetail.phoneNumber || "Sin teléfono"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderRoles(userData.userDetail.user.roles)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatus(userData.userDetail.user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userData.familyRelations && userData.familyRelations.length > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {userData.familyRelations.length} relaciones
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Sin relaciones
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => showUserDetails(userData, e)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(userData);
                            prepareRelationshipModal();
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <UserPlus className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Modal de detalles de usuario */}
      <AnimatePresence>
        {showUserDetailsModal && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Capa de fondo oscuro con onClick para cerrar */}
              <div 
                className="fixed inset-0 transition-opacity" 
                aria-hidden="true"
                onClick={closeAllModals}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              {/* Contenedor del modal con stopPropagation para evitar cierre indeseado */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Detalles del Usuario
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUserDetailsModal(false);
                          }}
                          className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Información Personal</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Nombre completo</p>
                            <p className="text-sm font-medium">
                              {selectedUser.userDetail.firstName || ''} {selectedUser.userDetail.middleName || ''} {selectedUser.userDetail.lastName || ''} {selectedUser.userDetail.secondLastName || ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Documento</p>
                            <p className="text-sm font-medium">
                              {selectedUser.userDetail.idType?.name || 'No especificado'}: {selectedUser.userDetail.dni || 'No especificado'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                            <p className="text-sm font-medium">
                              {selectedUser.userDetail.dateOfBirth || 'No especificada'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Cargo/Posición</p>
                            <p className="text-sm font-medium">
                              {selectedUser.userDetail.positionJob || 'No especificado'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Información de Contacto</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-sm font-medium">
                              {selectedUser.userDetail.user.email || 'No especificado'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Teléfono</p>
                            <p className="text-sm font-medium">
                              {selectedUser.userDetail.phoneNumber || 'No especificado'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Dirección</p>
                            <p className="text-sm font-medium">
                              {selectedUser.userDetail.address || 'No especificada'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Ciudad/Barrio</p>
                            <p className="text-sm font-medium">
                              {selectedUser.userDetail.city || 'No especificada'} / {selectedUser.userDetail.neighborhood || 'No especificado'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-800">Relaciones Familiares</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowUserDetailsModal(false);
                              prepareRelationshipModal();
                            }}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Añadir
                          </button>
                        </div>
                        
                        {!selectedUser.familyRelations || selectedUser.familyRelations.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500">Este usuario no tiene relaciones familiares registradas</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Familiar
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Relación
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {selectedUser.familyRelations.map((relation) => (
                                  <tr key={relation.id || `relation-${Math.random()}`} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                          <span className="text-gray-500 text-xs font-medium">
                                            {relation.relativeUser?.firstName?.charAt(0) || '?'}
                                            {relation.relativeUser?.lastName?.charAt(0) || '?'}
                                          </span>
                                        </div>
                                        <div className="ml-3">
                                          <div className="text-sm font-medium text-gray-900">
                                            {relation.relativeUser?.firstName || ''} {relation.relativeUser?.lastName || ''}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {relation.relativeUser?.user?.email || ''}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {relation.relationship?.relationshipType || 'No especificada'}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      {renderStatus(relation.relativeUser?.user?.status || 'I')}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                      <button
                                        onClick={(e) => deleteRelation(relation.id, e)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserDetailsModal(false);
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal para gestionar relaciones */}
      <AnimatePresence>
        {showRelationshipModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Capa de fondo oscuro con onClick para cerrar */}
              <div 
                className="fixed inset-0 transition-opacity" 
                aria-hidden="true"
                onClick={closeAllModals}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              {/* Contenedor del modal con stopPropagation para evitar cierre indeseado */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Gestionar Relaciones Familiares
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeAllModals();
                          }}
                          className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-800 mb-2">Usuario Principal</h4>
                        {selectedUser ? (
                          <div className="flex items-center bg-blue-50 p-3 rounded-md">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {selectedUser.userDetail.firstName?.charAt(0) || '?'}
                                {selectedUser.userDetail.lastName?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {selectedUser.userDetail.firstName || ''} {selectedUser.userDetail.lastName || ''}
                              </div>
                              <div className="text-sm text-gray-500">
                                {selectedUser.userDetail.user.username || ''} | {selectedUser.userDetail.user.email || ''}
                              </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(null);
                              }}
                              className="ml-auto text-gray-400 hover:text-gray-500"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-yellow-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  Seleccione un usuario principal para establecer relaciones familiares
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-md font-medium text-gray-800">Tipo de Relación</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowRelationTypeModal(true);
                            }}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Nuevo Tipo
                          </button>
                        </div>
                       
                        {relationshipTypes.length === 0 ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-yellow-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  No hay tipos de relación disponibles. Cree uno nuevo para continuar.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                            
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {relationshipTypes.map((type) => (
                              <div key={type.id} className="relative">
                                <input
                                  type="radio"
                                  id={`type-${type.id}`}
                                  name="relationshipType"
                                  value={type.id}
                                  checked={selectedRelationshipType === type.id}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setSelectedRelationshipType(type.id);
                                  }}
                                  className="absolute opacity-0 w-full h-full cursor-pointer"
                                />
                                <label
                                  htmlFor={`type-${type.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`block p-2 border rounded-md text-center cursor-pointer transition-colors ${
                                    selectedRelationshipType === type.id
                                      ? "bg-blue-100 border-blue-500 text-blue-700"
                                      : "bg-white border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {type.relationshipType}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="text-md font-medium text-gray-800 mb-2">Seleccionar Familiares</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Lista de origen (usuarios disponibles) */}
                          <div className="border border-gray-300 rounded-md">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-300 flex justify-between items-center">
                              <h5 className="text-sm font-medium text-gray-700">Usuarios Disponibles</h5>
                              <div className="relative w-40">
                                <input
                                  type="text"
                                  placeholder="Buscar..."
                                  value={sourceSearchTerm}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setSourceSearchTerm(e.target.value);
                                  }}
                                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                            <div className="h-64 overflow-y-auto p-2">
                              {filteredSourceUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                  <AlertCircle className="h-8 w-8 mb-2" />
                                  <p className="text-sm">No hay usuarios disponibles</p>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {filteredSourceUsers.map((user) => (
                                    <div
                                      key={`source-${user.userDetail.id}`}
                                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                                        selectedSourceUsers.includes(user.userDetail.id)
                                          ? "bg-blue-100"
                                          : "hover:bg-gray-100"
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedSourceUsers.includes(user.userDetail.id)) {
                                          setSelectedSourceUsers(
                                            selectedSourceUsers.filter(id => id !== user.userDetail.id)
                                          );
                                        } else {
                                          setSelectedSourceUsers([...selectedSourceUsers, user.userDetail.id]);
                                        }
                                      }}
                                    >
                                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-600 text-xs font-medium">
                                          {user.userDetail.firstName?.charAt(0) || '?'}
                                          {user.userDetail.lastName?.charAt(0) || '?'}
                                        </span>
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                          {user.userDetail.firstName || ''} {user.userDetail.lastName || ''}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {user.userDetail.user.email || ''}
                                        </p>
                                      </div>
                                      {selectedSourceUsers.includes(user.userDetail.id) && (
                                        <Check className="ml-auto h-5 w-5 text-blue-600" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Botones de transferencia */}
                          <div className="hidden lg:flex flex-col items-center justify-center">
                            <button
                              onClick={moveToTarget}
                              disabled={selectedSourceUsers.length === 0}
                              className={`p-2 rounded-full mb-2 ${
                                selectedSourceUsers.length === 0
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                              }`}
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                            <button
                              onClick={moveToSource}
                              disabled={selectedTargetUsers.length === 0}
                              className={`p-2 rounded-full ${
                                selectedTargetUsers.length === 0
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                              }`}
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                          </div>
                          
                          <div className="flex lg:hidden justify-center space-x-4 my-2">
                            <button
                              onClick={moveToTarget}
                              disabled={selectedSourceUsers.length === 0}
                              className={`p-2 rounded-md flex items-center ${
                                selectedSourceUsers.length === 0
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                              }`}
                            >
                              <ArrowRight className="h-5 w-5 mr-1" />
                              Añadir
                            </button>
                            <button
                              onClick={moveToSource}
                              disabled={selectedTargetUsers.length === 0}
                              className={`p-2 rounded-md flex items-center ${
                                selectedTargetUsers.length === 0
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                              }`}
                            >
                              <ChevronLeft className="h-5 w-5 mr-1" />
                              Quitar
                            </button>
                          </div>
                          
                          {/* Lista de destino (familiares seleccionados) */}
                          <div className="border border-gray-300 rounded-md">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                              <h5 className="text-sm font-medium text-gray-700">Familiares Seleccionados</h5>
                            </div>
                            <div className="h-64 overflow-y-auto p-2">
                              {targetUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                  <Users className="h-8 w-8 mb-2" />
                                  <p className="text-sm">No hay familiares seleccionados</p>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {targetUsers.map((user) => (
                                    <div
                                      key={`target-${user.userDetail.id}`}
                                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                                        selectedTargetUsers.includes(user.userDetail.id)
                                          ? "bg-blue-100"
                                          : "hover:bg-gray-100"
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedTargetUsers.includes(user.userDetail.id)) {
                                          setSelectedTargetUsers(
                                            selectedTargetUsers.filter(id => id !== user.userDetail.id)
                                          );
                                        } else {
                                          setSelectedTargetUsers([...selectedTargetUsers, user.userDetail.id]);
                                        }
                                      }}
                                    >
                                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">
                                        <span className="text-green-600 text-xs font-medium">
                                          {user.userDetail.firstName?.charAt(0) || '?'}
                                          {user.userDetail.lastName?.charAt(0) || '?'}
                                        </span>
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                          {user.userDetail.firstName || ''} {user.userDetail.lastName || ''}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {user.userDetail.user.email || ''}
                                        </p>
                                      </div>
                                      {selectedTargetUsers.includes(user.userDetail.id) && (
                                        <Check className="ml-auto h-5 w-5 text-blue-600" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={createFamilyRelations}
                    disabled={!selectedUser || targetUsers.length === 0 || !selectedRelationshipType}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                      !selectedUser || targetUsers.length === 0 || !selectedRelationshipType
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }`}
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Guardar Relaciones
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAllModals();
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal para crear nuevo tipo de relación */}
      <AnimatePresence>
        {showRelationTypeModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Capa de fondo oscuro con onClick para cerrar */}
              <div 
                className="fixed inset-0 transition-opacity" 
                aria-hidden="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRelationTypeModal(false);
                }}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              {/* Contenedor del modal con stopPropagation para evitar cierre indeseado */}
              // Aquí completo el código del componente, específicamente el modal para crear nuevo tipo de relación que quedó cortado

{/* Modal para crear nuevo tipo de relación */}
<motion.div 
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative"
  onClick={(e) => e.stopPropagation()}
>
  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
    <div className="sm:flex sm:items-start">
      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
        <Plus className="h-6 w-6 text-green-600" />
      </div>
      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Nuevo Tipo de Relación
        </h3>
        <div className="mt-4">
          <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700">
            Nombre del tipo de relación
          </label>
          <input
            type="text"
            id="relationshipType"
            name="relationshipType"
            value={newRelationshipType}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              setNewRelationshipType(e.target.value);
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Ej: Padre, Madre, Hermano, Tío..."
          />
        </div>
      </div>
    </div>
  </div>
  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
    <button
      type="button"
      onClick={createRelationshipType}
      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Crear
    </button>
    <button
      type="button"
      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
      onClick={(e) => {
        e.stopPropagation();
        setShowRelationTypeModal(false);
      }}
    >
      Cancelar
    </button>
  </div>
</motion.div>
</div>
</div>
)}
</AnimatePresence>
</main>
);
};

export default SystemUsers;
                