import React, { useState, useEffect } from "react";
import { UserPlus, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { AnimatePresence } from "framer-motion";

import { 
  systemService,
  UserList,
  UserDetailsModal,
  RelationshipManager,
  RelationTypeModal 
} from "../";

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

  // Cargar datos iniciales
  useEffect(() => {
    fetchInitialData();
  }, []);

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

  // Obtener tipos de relaciones
  const fetchRelationshipTypes = async () => {
    try {
      const relationTypes = await systemService.getAllFamilyRelationTypes();
      setRelationshipTypes(relationTypes);
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

  // Preparar datos para el modal de relaciones
  const prepareRelationshipModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
    }
    setShowRelationshipModal(true);
  };

  // Mostrar detalles de un usuario
  const showUserDetails = (user, e) => {
    if (e) e.stopPropagation();
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  // Cerrar todos los modales y limpiar estados
  const closeAllModals = () => {
    setShowUserDetailsModal(false);
    setShowRelationshipModal(false);
    setShowRelationTypeModal(false);
    // Pequeño retraso para evitar problemas de renderizado
    setTimeout(() => {
      setSelectedUser(null);
    }, 300);
  };

  // Crear nuevas relaciones familiares
  const createFamilyRelations = async (relationData) => {
    try {
      await systemService.createFamilyRelations(relationData);
      
      Swal.fire({
        icon: 'success',
        title: 'Relaciones creadas',
        text: 'Las relaciones familiares han sido creadas exitosamente',
        confirmButtonColor: '#3085d6'
      });
      
      // Recargar datos
      await fetchInitialData();
      
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
  const createRelationshipType = async (relationTypeData) => {
    try {
      await systemService.createFamilyRelationsTypes(relationTypeData);
      await fetchRelationshipTypes();
      
      Swal.fire({
        icon: 'success',
        title: 'Tipo de relación creado',
        text: 'El nuevo tipo de relación ha sido creado exitosamente',
        confirmButtonColor: '#3085d6'
      });
      
      return true;
    } catch (error) {
      console.error("Error al crear tipo de relación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el tipo de relación',
        confirmButtonColor: '#3085d6'
      });
      return false;
    }
  };

  // Actualizar tipo de relación
// Actualizar tipo de relación
const updateRelationshipType = async (id, relationTypeData) => {
  try {
    await systemService.updateFamilyRelationTypes(id, relationTypeData);
    
    // Mensaje de éxito específico para actualización
    Swal.fire({
      icon: 'success',
      title: 'Tipo de relación actualizado',
      text: 'El tipo de relación ha sido actualizado exitosamente',
      confirmButtonColor: '#3085d6'
    });
    
    await fetchRelationshipTypes();
    return true;
  } catch (error) {
    console.error("Error al actualizar tipo de relación:", error);
    
    // Mostrar el mensaje específico de error que viene del servicio
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo actualizar el tipo de relación',
      confirmButtonColor: '#3085d6'
    });
    return false;
  }
};

// Eliminar tipo de relación
const deleteRelationshipType = async (id) => {
  try {
    await systemService.deleteFamilyRelationTypes(id);
    
    // Mensaje de éxito específico para eliminación
    Swal.fire({
      icon: 'success',
      title: 'Tipo de relación eliminado',
      text: 'El tipo de relación ha sido eliminado exitosamente',
      confirmButtonColor: '#3085d6'
    });
    
    await fetchRelationshipTypes();
    return true;
  } catch (error) {
    console.error("Error al eliminar tipo de relación:", error);
    
    // Mostrar el mensaje específico de error que viene del servicio
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo eliminar el tipo de relación',
      confirmButtonColor: '#3085d6'
    });
    return false;
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
          await fetchInitialData();
          
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

  return (
    <main className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios y Relaciones Familiares</h1>
            {/* <button
              onClick={() => prepareRelationshipModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Gestionar Relaciones
            </button> */}
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <UserList 
          users={users}
          filteredUsers={filteredUsers}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          availableRoles={availableRoles}
          showUserDetails={showUserDetails}
          prepareRelationshipModal={prepareRelationshipModal}
        />
      </section>

      {/* Modales */}
      <AnimatePresence>
        {showUserDetailsModal && (
          <UserDetailsModal 
            showModal={showUserDetailsModal}
            selectedUser={selectedUser}
            closeModal={closeAllModals}
            prepareRelationshipModal={prepareRelationshipModal}
            deleteRelation={deleteRelation}
          />
        )}

        {showRelationshipModal && (
          <RelationshipManager 
            showModal={showRelationshipModal}
            closeModal={closeAllModals}
            selectedUser={selectedUser}
            users={users}
            relationshipTypes={relationshipTypes}
            createFamilyRelations={createFamilyRelations}
            showRelationTypeModal={() => setShowRelationTypeModal(true)}
          />
        )}

        {showRelationTypeModal && (
          <RelationTypeModal 
            showModal={showRelationTypeModal}
            closeModal={() => setShowRelationTypeModal(false)}
            relationshipTypes={relationshipTypes}
            createRelationshipType={createRelationshipType}
            updateRelationshipType={updateRelationshipType}
            deleteRelationshipType={deleteRelationshipType}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default SystemUsers;
