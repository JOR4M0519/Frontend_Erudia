import React, { useState, useEffect } from "react";
import { 
  ChevronDown, ChevronUp, Search, Filter, Edit, 
  Trash2, AlertTriangle, BookOpen, User, RefreshCw,
  X,Check
} from "lucide-react";
import Swal from "sweetalert2";
import { configurationService,AssignProfessorModal } from "../../";

const SubjectProfessorsTab = ({ 
  subjects, 
  professors, 
  subjectProfessors, 
  showFilters,
  editMode = false,
  onDataUpdated
}) => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSubjects, setExpandedSubjects] = useState({});
  
  // Estado para modal de edición
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // Estado para carga
  const [loading, setLoading] = useState(false);

  // Agrupar profesores por materia
  const groupedBySubject = React.useMemo(() => {
    const grouped = {};
    
    // Inicializar con todas las materias, incluso las que no tienen profesores
    subjects.forEach(subject => {
      grouped[subject.id] = {
        subject: subject,
        professors: []
      };
    });
    
    // Agregar las relaciones de profesores
    subjectProfessors.forEach(relation => {
      if (grouped[relation.subject.id]) {
        grouped[relation.subject.id].professors.push({
          relationId: relation.id,
          professor: relation.professor
        });
      }
    });
    
    return Object.values(grouped);
  }, [subjects, subjectProfessors]);

  // Filtrar materias según el término de búsqueda
  const filteredSubjects = groupedBySubject.filter(group => {
    return group.subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Expandir/colapsar una materia
  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // Manejadores para acciones CRUD
  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setShowEditSubjectModal(true);
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará la materia y todas sus relaciones",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await configurationService.deleteSubject(subjectId);
        
        // Notificar cambio para recargar datos
        if (onDataUpdated) onDataUpdated();
        
        Swal.fire(
          '¡Eliminado!',
          'La materia ha sido eliminada correctamente.',
          'success'
        );
      }
    } catch (error) {
      console.error("Error al eliminar materia:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la materia. Puede que tenga relaciones activas.'
      });
    }
  };

  const handleDeleteRelation = async (relationId) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará la asignación del profesor a esta materia",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await configurationService.deleteSubjectProfessor(relationId);
        
        // Notificar cambio para recargar datos
        if (onDataUpdated) onDataUpdated();
        
        Swal.fire(
          '¡Eliminado!',
          'La asignación ha sido eliminada correctamente.',
          'success'
        );
      }
    } catch (error) {
      console.error("Error al eliminar relación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la asignación.'
      });
    }
  };

  const handleUpdateSubject = async (subjectId, updatedData) => {
    try {
      setLoading(true);
      await configurationService.updateSubject(subjectId, updatedData);
      
      // Notificar cambio para recargar datos
      if (onDataUpdated) onDataUpdated();
      
      setShowEditSubjectModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'La materia ha sido actualizada correctamente.'
      });
    } catch (error) {
      console.error("Error al actualizar materia:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la materia.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el badge de estado
  const getStatusBadge = (status) => {
    switch (status) {
      case 'A':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Activo
          </span>
        );
      case 'I':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Inactivo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Desconocido
          </span>
        );
    }
  };

  return (
    <div className="p-4">
      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar materia
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre de la materia..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setExpandedSubjects({});
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
              >
                <RefreshCw size={16} className="mr-1" />
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de materias con acordeón */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSubjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No se encontraron materias con los filtros seleccionados.</p>
            </div>
          ) : (
            filteredSubjects.map((group) => (
              <div key={group.subject.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Cabecera del acordeón */}
                <div
                  className={`p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${
                    expandedSubjects[group.subject.id] ? "bg-blue-50" : ""
                  }`}
                  onClick={() => toggleSubject(group.subject.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-blue-600">
                      {expandedSubjects[group.subject.id] ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {group.subject.subjectName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(group.subject.status)}
                        <span className="text-sm text-gray-500">
                          {group.professors.length} {group.professors.length === 1 ? "profesor" : "profesores"} asignados
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {editMode && (
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSubject(group.subject);
                        }}
                        className="p-1 text-amber-600 hover:text-amber-800 transition-colors"
                        title="Editar materia"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(group.subject.id);
                        }}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar materia"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contenido del acordeón */}
                {expandedSubjects[group.subject.id] && (
                  <div className="border-t border-gray-200 p-4">
                    {group.professors.length === 0 ? (
                      <div className="flex items-center justify-center py-4 text-gray-500">
                        <AlertTriangle size={18} className="mr-2 text-amber-500" />
                        No hay profesores asignados a esta materia
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Profesor
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                              </th>
                              {editMode && (
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Acciones
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {group.professors.map((relation) => (
                              <tr key={relation.relationId}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-blue-100 rounded-full">
                                      <User size={16} className="text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {relation.professor.firstName} {relation.professor.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {relation.professor.username}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{relation.professor.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getStatusBadge(relation.professor.status)}
                                </td>
                                {editMode && (
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                      onClick={() => handleDeleteRelation(relation.relationId)}
                                      className="text-red-600 hover:text-red-900 transition-colors"
                                      title="Eliminar asignación"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal para editar materia */}
      {showEditSubjectModal && selectedSubject && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold text-gray-800">Editar Materia</h2>
              <button
                onClick={() => setShowEditSubjectModal(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateSubject(selectedSubject.id, {
                  subjectName: e.target.subjectName.value,
                  status: e.target.status.value
                });
              }} 
              className="p-4"
            >
              <div className="mb-4">
                <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Materia
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="subjectName"
                    name="subjectName"
                    defaultValue={selectedSubject.subjectName}
                    placeholder="Ej. Matemáticas"
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={selectedSubject.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditSubjectModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : (
                    <Check size={18} className="mr-1" />
                  )}
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectProfessorsTab;
