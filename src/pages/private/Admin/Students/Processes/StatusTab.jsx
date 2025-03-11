import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Filter, Users, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { studentAdminService } from "../studentAdminService";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4 border border-gray-200">
        <div className="flex items-center mb-5">
          <AlertCircle className="h-7 w-7 text-amber-500 mr-3 flex-shrink-0" />
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="mb-8 text-gray-600 text-base leading-relaxed">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors shadow-sm border border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 cursor-pointer bg-primary hover:bg-primary-dark hover:bg-gray-50 text-black font-medium rounded-md transition-colors shadow-sm focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusTab = ({ year = new Date().getFullYear() }) => {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedStudents, setSelectedStudents] = useState({});
  const [targetStatus, setTargetStatus] = useState("A");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [selectAll, setSelectAll] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Estados de promoción disponibles con su mapeo para la UI
  const promotionStatuses = [
    { code: "A", label: "Activo" },
    { code: "R", label: "Repitente" },
    { code: "P", label: "Pendiente" }
  ];

  // Función para convertir código a etiqueta
  const getStatusLabel = (code) => {
    const status = promotionStatuses.find(s => s.code === code);
    return status ? status.label : "No asignado";
  };

  // Función para convertir etiqueta a código
  const getStatusCode = (label) => {
    const status = promotionStatuses.find(s => s.label.toLowerCase() === label.toLowerCase());
    return status ? status.code : null;
  };

  useEffect(() => {
    // Cargar datos usando el servicio correcto
    const loadData = async () => {
      try {
        const data = await studentAdminService.getStudentsByGroups();
        setStudentsData(data);
        
        // Inicializar grupos expandidos
        const groups = {};
        data.forEach(item => {
          if (!groups[item.group.id]) {
            groups[item.group.id] = true; // Por defecto expandidos
          }
        });
        setExpandedGroups(groups);
      } catch (error) {
        console.error("Error al cargar los estudiantes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Agrupar estudiantes por grupo
  const groupedStudents = studentsData.reduce((acc, item) => {
    const groupId = item.group.id;
    if (!acc[groupId]) {
      acc[groupId] = {
        groupInfo: item.group,
        students: []
      };
    }
    
    // Solo agregar el estudiante si su estado coincide con el filtro o si el filtro es "todos"
    if (filterStatus === "todos" || 
        (item.student.promotionStatus === filterStatus) || 
        (filterStatus === "sin-estado" && !item.student.promotionStatus)) {
      acc[groupId].students.push(item);
    }
    
    return acc;
  }, {});

  // Ordenar grupos por nivel educativo
  const sortedGroups = Object.values(groupedStudents).sort((a, b) => {
    return a.groupInfo.level.id - b.groupInfo.level.id;
  });

  const toggleGroupExpand = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleSelectStudent = (studentId) => {
    setSelectedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const toggleSelectGroup = (groupId) => {
    const groupStudents = groupedStudents[groupId].students;
    const allSelected = groupStudents.every(item => selectedStudents[item.student.id]);
    
    const newSelectedStudents = { ...selectedStudents };
    
    groupStudents.forEach(item => {
      newSelectedStudents[item.student.id] = !allSelected;
    });
    
    setSelectedStudents(newSelectedStudents);
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelectedStudents = {};
    Object.values(groupedStudents).forEach(group => {
      group.students.forEach(item => {
        newSelectedStudents[item.student.id] = newSelectAll;
      });
    });
    
    setSelectedStudents(newSelectedStudents);
  };

  // Solicitar confirmación para cambiar el estado de un estudiante individual
  const confirmChangeIndividualStatus = (studentId, studentName, currentStatus, newStatus) => {
    const currentLabel = currentStatus ? getStatusLabel(currentStatus) : 'No asignado';
    const newLabel = getStatusLabel(newStatus);
    
    setConfirmDialog({
      isOpen: true,
      title: "Confirmar cambio de estado",
      message: `¿Estás seguro de que deseas cambiar el estado de ${studentName} de "${currentLabel}" a "${newLabel}"?`,
      onConfirm: () => {
        handleChangeIndividualStatus(studentId, newStatus);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Cambiar el estado de un estudiante individual
  const handleChangeIndividualStatus = async (studentId, newStatus) => {
    try {
      console.log(`Cambiando estado del estudiante ${studentId} a "${newStatus}"`);
      
      // Llamada a la API para actualizar el estado individual
      await studentAdminService.updatePromotionStatus({
        id: studentId,
        promotionStatus: newStatus
      });
      
      // Actualización local después de la llamada exitosa
      const updatedData = studentsData.map(item => {
        if (item.student.id === studentId) {
          return {
            ...item,
            student: {
              ...item.student,
              promotionStatus: newStatus
            }
          };
        }
        return item;
      });
      
      setStudentsData(updatedData);
    } catch (error) {
      console.error("Error al cambiar el estado del estudiante:", error);
    }
  };

  // Solicitar confirmación para cambiar estados en masa
  const confirmChangeBulkStatus = (groupId = null) => {
    let studentsToUpdate = [];
    let groupName = "";
    
    if (groupId) {
      // Para un grupo específico
      studentsToUpdate = groupedStudents[groupId].students
        .filter(item => selectedStudents[item.student.id])
        .map(item => item.student.id);
      groupName = groupedStudents[groupId].groupInfo.groupName;
    } else {
      // Para todos los estudiantes seleccionados
      studentsToUpdate = Object.entries(selectedStudents)
        .filter(([_, isSelected]) => isSelected)
        .map(([id, _]) => parseInt(id));
    }
    
    if (studentsToUpdate.length === 0) {
      return;
    }
    
    const targetLabel = getStatusLabel(targetStatus);
    
    setConfirmDialog({
      isOpen: true,
      title: "Confirmar cambio masivo de estado",
      message: groupId 
        ? `¿Estás seguro de que deseas cambiar el estado de ${studentsToUpdate.length} estudiantes del grupo "${groupName}" a "${targetLabel}"?`
        : `¿Estás seguro de que deseas cambiar el estado de ${studentsToUpdate.length} estudiantes seleccionados a "${targetLabel}"?`,
      onConfirm: () => {
        handleChangeBulkStatus(groupId);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Solicitar confirmación para cambiar todos los estudiantes de un grupo
  const confirmChangeEntireGroup = (groupId) => {
    const groupStudents = groupedStudents[groupId].students;
    const groupName = groupedStudents[groupId].groupInfo.groupName;
    const targetLabel = getStatusLabel(targetStatus);
    
    setConfirmDialog({
      isOpen: true,
      title: "Confirmar cambio de estado para todo el grupo",
      message: `¿Estás seguro de que deseas cambiar el estado de TODOS los estudiantes (${groupStudents.length}) del grupo "${groupName}" a "${targetLabel}"?`,
      onConfirm: () => {
        handleChangeEntireGroup(groupId);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Cambiar el estado de todos los estudiantes de un grupo
  const handleChangeEntireGroup = async (groupId) => {
    try {
      const groupStudents = groupedStudents[groupId].students.map(item => ({
        id: item.student.id,
        promotionStatus: targetStatus
      }));
      
      console.log(`Cambiando estado de TODOS los ${groupStudents.length} estudiantes del grupo ${groupId} a "${targetStatus}"`);
      
      // Llamada a la API para actualizar los estados del grupo completo
      await studentAdminService.updateBulkPromotionStatus(groupStudents);
      
      // Actualización local después de la llamada exitosa
      const updatedData = studentsData.map(item => {
        if (item.group.id === groupId) {
          return {
            ...item,
            student: {
              ...item.student,
              promotionStatus: targetStatus
            }
          };
        }
        return item;
      });
      
      setStudentsData(updatedData);
    } catch (error) {
      console.error("Error al cambiar el estado del grupo completo:", error);
    }
  };

  // Cambiar el estado de múltiples estudiantes seleccionados
  const handleChangeBulkStatus = async (groupId = null) => {
    try {
      let studentsToUpdate = [];
      
      if (groupId) {
        // Cambiar solo para un grupo específico
        studentsToUpdate = groupedStudents[groupId].students
          .filter(item => selectedStudents[item.student.id])
          .map(item => ({
            id: item.student.id,
            promotionStatus: targetStatus
          }));
      } else {
        // Cambiar para todos los estudiantes seleccionados
        studentsToUpdate = Object.entries(selectedStudents)
          .filter(([_, isSelected]) => isSelected)
          .map(([id, _]) => ({
            id: parseInt(id),
            promotionStatus: targetStatus
          }));
      }
      
      if (studentsToUpdate.length === 0) {
        return;
      }
      
      console.log(`Cambiando estado a "${targetStatus}" para ${studentsToUpdate.length} estudiantes:`, studentsToUpdate);
      
      // Llamada a la API para actualizar los estados en masa
      await studentAdminService.updateBulkPromotionStatus(studentsToUpdate);
      
      // Actualización local después de la llamada exitosa
      const updatedData = studentsData.map(item => {
        if (studentsToUpdate.some(student => student.id === item.student.id)) {
          return {
            ...item,
            student: {
              ...item.student,
              promotionStatus: targetStatus
            }
          };
        }
        return item;
      });
      
      setStudentsData(updatedData);
      
      // Limpiar selecciones después de actualizar
      if (!groupId) {
        setSelectedStudents({});
        setSelectAll(false);
      }
    } catch (error) {
      console.error("Error al cambiar estados en masa:", error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "A":
        return "bg-green-100 text-green-800 border-green-200";
      case "R":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "P":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Cargando estudiantes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Gestión de Estados de Promoción - {year}
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                {promotionStatuses.map(status => (
                  <option key={status.code} value={status.code}>{status.label}</option>
                ))}
                <option value="sin-estado">Sin estado asignado</option>
              </select>
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>
          
          <div className="flex items-center ml-auto">
            <span className="mr-2 text-sm text-gray-600">Cambiar seleccionados a:</span>
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
              >
                {promotionStatuses.map(status => (
                  <option key={status.code} value={status.code}>{status.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="mb-4 flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
              checked={selectAll}
              onChange={toggleSelectAll}
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Seleccionar todos los estudiantes</span>
          </label>
          
          <button
            onClick={() => confirmChangeBulkStatus()}
            disabled={Object.values(selectedStudents).filter(Boolean).length === 0}
            className={`ml-auto px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              Object.values(selectedStudents).filter(Boolean).length > 0
                ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Cambiar estado de seleccionados
          </button>
        </div>
        
        <div className="space-y-4">
          {sortedGroups.length > 0 ? (
            sortedGroups.map(({ groupInfo, students }) => (
              <div 
                key={groupInfo.id} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div 
                  className="flex items-center justify-between bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleGroupExpand(groupInfo.id)}
                >
                  <div className="flex items-center">
                    {expandedGroups[groupInfo.id] ? (
                      <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{groupInfo.groupName}</h3>
                      <p className="text-xs text-gray-500">{groupInfo.level.levelName}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">{students.length} estudiantes</span>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedGroups[groupInfo.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-2">
                        <div className="flex justify-between items-center mb-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                              checked={students.every(item => selectedStudents[item.student.id])}
                              onChange={() => toggleSelectGroup(groupInfo.id)}
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Seleccionar todo el grupo
                            </span>
                          </label>
                          
                          <button
                            onClick={() => confirmChangeEntireGroup(groupInfo.id)}
                            className="px-3 py-1 rounded-md text-xs font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
                          >
                            Cambiar todo el grupo a {getStatusLabel(targetStatus)}
                          </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                                  <span className="sr-only">Seleccionar</span>
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Estudiante
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Estado Actual
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Cambiar a
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {students.map((item) => (
                                <tr 
                                  key={item.id} 
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                      checked={!!selectedStudents[item.student.id]}
                                      onChange={() => toggleSelectStudent(item.student.id)}
                                    />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {item.student.firstName} {item.student.lastName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {item.student.username}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                      item.student.promotionStatus 
                                        ? getStatusBadgeClass(item.student.promotionStatus)
                                        : "bg-gray-100 text-gray-800 border-gray-200"
                                    }`}>
                                      {item.student.promotionStatus ? getStatusLabel(item.student.promotionStatus) : "No asignado"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex space-x-1">
                                      {promotionStatuses.map(status => (
                                        <button
                                          key={status.code}
                                          onClick={() => confirmChangeIndividualStatus(
                                            item.student.id, 
                                            `${item.student.firstName} ${item.student.lastName}`,
                                            item.student.promotionStatus,
                                            status.code
                                          )}
                                          disabled={item.student.promotionStatus === status.code}
                                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                            item.student.promotionStatus === status.code
                                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                              : `${getStatusBadgeClass(status.code)} hover:opacity-80`
                                          }`}
                                          title={`Cambiar a ${status.label}`}
                                        >
                                          {status.label}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="flex justify-between mt-4">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">
                              {students.filter(item => selectedStudents[item.student.id]).length} estudiantes seleccionados
                            </span>
                          </div>
                          
                          <button
                            onClick={() => confirmChangeBulkStatus(groupInfo.id)}
                            disabled={!students.some(item => selectedStudents[item.student.id])}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              students.some(item => selectedStudents[item.student.id])
                                ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Cambiar seleccionados a {getStatusLabel(targetStatus)}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay estudiantes que coincidan con el filtro seleccionado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusTab;
