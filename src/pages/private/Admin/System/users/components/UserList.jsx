import React from "react";
import { Users, Search, Filter, UserPlus, Eye } from "lucide-react";
import { motion } from "framer-motion";

const UserList = ({ 
  users,
  filteredUsers, 
  isLoading, 
  searchTerm, 
  setSearchTerm, 
  selectedRole, 
  setSelectedRole, 
  availableRoles,
  showUserDetails,
  prepareRelationshipModal
}) => {
  
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
    <>
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Users className="h-8 w-8 text-blue-500" />
            </motion.div>
            <span className="ml-2 text-lg text-gray-600">Cargando usuarios...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-10">
            <Users className="h-12 w-12 text-yellow-500 mb-2" />
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
                          prepareRelationshipModal(userData);
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
    </>
  );
};

export default UserList;
