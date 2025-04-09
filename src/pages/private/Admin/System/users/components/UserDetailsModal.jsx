import React from "react";
import { X, UserPlus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2"; // Importamos SweetAlert2

const UserDetailsModal = ({ 
  showModal, 
  selectedUser, 
  closeModal, 
  prepareRelationshipModal, 
  deleteRelation 
}) => {
  
  // Verificar si un usuario tiene el rol de "estudiante"
  const isStudent = (user) => {
    if (!user?.userDetail?.user?.roles || user.userDetail.user.roles.length === 0) return false;
    
    return user.userDetail.user.roles.some(role => 
      role.role.roleName.toLowerCase() === 'estudiante'
    );
  };

  // Manejar clic en el botón "Añadir"
  const handleAddRelationClick = (e) => {
    e.stopPropagation();
    closeModal();

    if (isStudent(selectedUser)) {
      prepareRelationshipModal(selectedUser);
    } else {
      // Mostrar SweetAlert con el mensaje indicado
      Swal.fire({
        title: 'Acción no permitida',
        text: 'Solo se pueden agregar a los estudiantes un familiar',
        icon: 'warning',
        confirmButtonColor: '#3085d6'
      });
    }
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

  if (!showModal || !selectedUser) return null;

  // Filtrar relaciones duplicadas basadas en el ID
  const uniqueFamilyRelations = selectedUser.familyRelations ? 
    selectedUser.familyRelations.reduce((acc, current) => {
      const exists = acc.find(item => item.id === current.id);
      if (!exists) {
        return [...acc, current];
      }
      return acc;
    }, []) : [];

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
                      closeModal();
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
                      onClick={handleAddRelationClick}
                      className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                        isStudent(selectedUser) 
                          ? "text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                          : "text-gray-500 bg-gray-100 cursor-not-allowed"
                      }`}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Añadir
                    </button>
                  </div>
                  
                  {!uniqueFamilyRelations.length ? (
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
                          {uniqueFamilyRelations.map((relation) => {
                            // Determinar quién es el familiar en esta relación
                            // Si el userId del usuario actual coincide con el user.id de la relación, entonces relativeUser es el familiar
                            // Si no, el familiar es user
                            const currentUserIsMainUser = relation.user.id === selectedUser.userDetail.user.id;
                            const familyMember = currentUserIsMainUser ? relation.relativeUser : relation.user;
                            
                            return (
                              <tr key={relation.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-gray-500 text-xs font-medium">
                                        {familyMember?.firstName?.charAt(0) || '?'}
                                        {familyMember?.lastName?.charAt(0) || '?'}
                                      </span>
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">
                                        {familyMember?.firstName || ''} {familyMember?.lastName || ''}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {familyMember?.email || ''}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {relation.relationship?.relationshipType || 'No especificada'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {renderStatus(familyMember?.status || 'I')}
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
                            );
                          })}
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
                closeModal();
              }}
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDetailsModal;