import React, { useState, useEffect } from "react";
import { 
  Users, Search, ChevronRight, ChevronLeft, 
  ArrowRight, X, AlertCircle, Check, Save, Plus 
} from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const RelationshipManager = ({ 
  showModal, 
  closeModal, 
  selectedUser, 
  users, 
  relationshipTypes,
  createFamilyRelations,
  showRelationTypeModal
}) => {
  // Estados para gestión de relaciones
  const [selectedRelationshipType, setSelectedRelationshipType] = useState(null);
  const [sourceUsers, setSourceUsers] = useState([]);
  const [targetUsers, setTargetUsers] = useState([]);
  const [selectedSourceUsers, setSelectedSourceUsers] = useState([]);
  const [selectedTargetUsers, setSelectedTargetUsers] = useState([]);
  const [sourceSearchTerm, setSourceSearchTerm] = useState("");
  const [filteredSourceUsers, setFilteredSourceUsers] = useState([]);

  // Inicializar estados cuando se abre el modal
  useEffect(() => {
    if (showModal) {
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
      
      // Seleccionar el primer tipo de relación por defecto si hay alguno disponible
      if (relationshipTypes.length > 0) {
        setSelectedRelationshipType(relationshipTypes[0].id);
      } else {
        setSelectedRelationshipType(null);
      }
    }
  }, [showModal, selectedUser, users, relationshipTypes]);

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
  const handleCreateRelations = async (e) => {
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

      await createFamilyRelations(relationData);
      closeModal();
      
    } catch (error) {
      console.error("Error al crear relaciones:", error);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Capa de fondo oscuro con onClick para cerrar */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={closeModal}
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
                      closeModal();
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
                        showRelationTypeModal();
                      }}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Gestionar Tipos
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
              onClick={handleCreateRelations}
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
                closeModal();
              }}
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RelationshipManager;
