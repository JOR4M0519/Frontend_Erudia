import React, { useState, useEffect } from "react";
import { ChevronDown, ArrowRight, CheckCircle, AlertCircle, XCircle, User, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { studentAdminService } from "../studentAdminService";

const PromotionsTab = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedStudents, setSelectedStudents] = useState({});
  const [targetGroups, setTargetGroups] = useState({});
  const [showOnlyPromotable, setShowOnlyPromotable] = useState(true);

  // Cargar datos de estudiantes por grupo
  useEffect(() => {
    const fetchStudentsByGroups = async () => {
      try {
        setLoading(true);
        
        // Obtener estudiantes agrupados por grupo
        const studentGroupsData = await studentAdminService.getStudentsByGroups();
        console.log("Datos de estudiantes:", studentGroupsData);
        
        // Obtener grupos activos para las opciones de destino
        const activeGroups = await studentAdminService.getActiveGroups();
        console.log("Grupos activos:", activeGroups);
        
        // Organizar estudiantes por grupo
        const groupedData = groupStudentsByGroup(studentGroupsData);
        console.log("Datos agrupados:", groupedData);
        
        // Procesar datos
        const processedGroups = processGroupData(groupedData, activeGroups);
        console.log("Grupos procesados:", processedGroups);
        
        setGroups(processedGroups);
        
        // Inicializar estados expandidos y selecciones
        const initialExpandedState = {};
        const initialSelectedState = {};
        const initialTargetGroups = {};
        
        processedGroups.forEach(group => {
          initialExpandedState[group.id] = true;
          initialSelectedState[group.id] = {};
          initialTargetGroups[group.id] = null;
          
          group.students.forEach(student => {
            // Solo preseleccionar estudiantes con estado "A" (Activo)
            initialSelectedState[group.id][student.id] = student.status === "A";
          });
        });
        
        setExpandedGroups(initialExpandedState);
        setSelectedStudents(initialSelectedState);
        setTargetGroups(initialTargetGroups);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos de estudiantes:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error de carga',
          text: 'No se pudieron cargar los datos de estudiantes y grupos',
          confirmButtonColor: '#3085d6'
        });
        setLoading(false);
      }
    };
    
    fetchStudentsByGroups();
  }, []);

  // Agrupar estudiantes por grupo
  const groupStudentsByGroup = (studentGroupsData) => {
    const groupedData = {};
    
    studentGroupsData.forEach(item => {
      const groupId = item.group.id;
      const groupName = item.group.groupName;
      const levelName = item.group.level.levelName;
      const levelId = item.group.level.id;
      const student = item.student;
      
      if (!groupedData[groupId]) {
        groupedData[groupId] = {
          id: groupId,
          name: groupName,
          level: levelName,
          levelId: levelId,
          students: []
        };
      }
      
      // Evitar duplicados (por si acaso)
      const existingStudent = groupedData[groupId].students.find(s => s.id === student.id);
      if (!existingStudent) {
        groupedData[groupId].students.push({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          status: student.status,
          promotionStatus: student.promotionStatus
        });
      }
    });
    
    return groupedData;
  };

  // Procesar datos de grupos y estudiantes
  const processGroupData = (groupedData, activeGroups) => {
    return Object.values(groupedData).map(group => {
      // Encontrar el grupo actual en la lista de grupos activos
      const currentGroup = activeGroups.find(g => g.id === group.id);
      
      // Determinar el orden del nivel
      const levelOrder = currentGroup ? getLevelOrder(currentGroup.level.levelName) : 0;
      
      // Filtrar grupos de destino posibles (mismo nivel o un nivel superior)
      const possibleTargetGroups = activeGroups.filter(g => {
        if (g.id === group.id) return false; // No incluir el mismo grupo
        
        const targetLevelOrder = getLevelOrder(g.level.levelName);
        return targetLevelOrder >= levelOrder && targetLevelOrder <= levelOrder + 1;
      });
      
      return {
        ...group,
        levelOrder,
        possibleTargetGroups
      };
    });
  };

  // Función para determinar el orden del nivel educativo
  const getLevelOrder = (levelName) => {
    const levels = [
      "PREJARDÍN", "JARDÍN", "TRANSICIÓN", 
      "PRIMERO", "SEGUNDO", "TERCERO", "CUARTO", "QUINTO",
      "SEXTO", "SÉPTIMO", "OCTAVO", "NOVENO", "DÉCIMO", "UNDÉCIMO"
    ];
    
    const index = levels.findIndex(level => level === levelName);
    return index !== -1 ? index : 0;
  };

  // Obtener etiqueta de estado legible
  const getStatusLabel = (status, promotionStatus) => {
    // Primero verificar el estado de promoción
    if (promotionStatus === 'P') return { text: 'Pendiente', color: 'text-amber-500', icon: AlertCircle, bgColor: 'bg-amber-50' };
    if (promotionStatus === 'R') return { text: 'Repitente', color: 'text-red-500', icon: XCircle, bgColor: 'bg-red-50' };
    
    // Si no hay estado de promoción específico, usar el estado general
    switch(status) {
      case 'A': return { text: 'Activo', color: 'text-green-600', icon: CheckCircle, bgColor: 'bg-green-50' };
      case 'I': return { text: 'Inactivo', color: 'text-gray-500', icon: XCircle, bgColor: 'bg-gray-50' };
      default: return { text: 'Desconocido', color: 'text-gray-500', icon: AlertCircle, bgColor: 'bg-gray-50' };
    }
  };

  // Alternar expansión de grupo
  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Seleccionar/deseleccionar todos los estudiantes de un grupo
  const toggleAllStudentsInGroup = (groupId, selected) => {
    setSelectedStudents(prev => {
      const newState = { ...prev };
      const group = groups.find(g => g.id === groupId);
      
      if (group) {
        group.students.forEach(student => {
          // Solo permitir seleccionar estudiantes activos si showOnlyPromotable está activado
          if (!showOnlyPromotable || student.status === 'A') {
            newState[groupId][student.id] = selected;
          }
        });
      }
      
      return newState;
    });
  };

  // Alternar selección de un estudiante
  const toggleStudentSelection = (groupId, studentId) => {
    setSelectedStudents(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [studentId]: !prev[groupId][studentId]
      }
    }));
  };

  // Cambiar grupo destino
  const handleTargetGroupChange = (sourceGroupId, targetGroupId) => {
    setTargetGroups(prev => ({
      ...prev,
      [sourceGroupId]: targetGroupId
    }));
  };

  // Promover estudiantes de un grupo
  const promoteStudentsFromGroup = async (groupId) => {
    const targetGroupId = targetGroups[groupId];
    if (!targetGroupId) {
      Swal.fire({
        icon: 'warning',
        title: 'Grupo destino requerido',
        text: 'Por favor, seleccione un grupo destino para la promoción',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }
    
    const selectedStudentIds = Object.entries(selectedStudents[groupId])
      .filter(([_, isSelected]) => isSelected)
      .map(([studentId]) => parseInt(studentId));
      
    if (selectedStudentIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Ningún estudiante seleccionado',
        text: 'Por favor, seleccione al menos un estudiante para promover',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar datos para la promoción usando el nuevo formato DTO
      const promotionData = {
        studentIds: selectedStudentIds,
        targetGroupId: parseInt(targetGroupId),
        promotionStatus: "A"  // Por defecto promover como Activo
      };
      
      // Llamada al servicio para actualizar estados de promoción
      await studentAdminService.promoteStudents(promotionData);
      
      Swal.fire({
        icon: 'success',
        title: '¡Promoción exitosa!',
        text: `${selectedStudentIds.length} estudiantes han sido promovidos exitosamente`,
        confirmButtonColor: '#F59E0B'
      });
      
      // Recargar datos después de la promoción
      const studentsByGroups = await studentAdminService.getStudentsByGroups();
      const activeGroups = await studentAdminService.getActiveGroups();
      
      // Organizar estudiantes por grupo
      const groupedData = groupStudentsByGroup(studentsByGroups);
      
      // Procesar datos
      const processedGroups = processGroupData(groupedData, activeGroups);
      setGroups(processedGroups);
      
      // Reiniciar selecciones
      const initialSelectedState = {};
      processedGroups.forEach(group => {
        initialSelectedState[group.id] = {};
        group.students.forEach(student => {
          initialSelectedState[group.id][student.id] = student.status === "A";
        });
      });
      setSelectedStudents(initialSelectedState);
      
    } catch (error) {
      console.error("Error al promover estudiantes:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error en la promoción',
        text: 'No se pudieron promover los estudiantes. Por favor, intente nuevamente.',
        confirmButtonColor: '#F59E0B'
      });
    } finally {
      setLoading(false);
    }
  };

  // Promover todos los estudiantes activos de todos los grupos
  const promoteAllActiveStudents = async () => {
    // Verificar que todos los grupos tengan un grupo destino seleccionado
    const groupsWithoutTarget = groups
      .filter(group => !targetGroups[group.id])
      .map(group => group.name);
      
    if (groupsWithoutTarget.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Grupos sin destino',
        html: `Los siguientes grupos no tienen un destino seleccionado:<br><br>${groupsWithoutTarget.join('<br>')}`,
        confirmButtonColor: '#F59E0B'
      });
      return;
    }
    
    // Recopilar todos los estudiantes seleccionados por grupo de destino
    const promotionsByTarget = {};
    
    groups.forEach(group => {
      const targetId = targetGroups[group.id];
      if (!targetId) return;
      
      if (!promotionsByTarget[targetId]) {
        promotionsByTarget[targetId] = [];
      }
      
      Object.entries(selectedStudents[group.id])
        .filter(([_, isSelected]) => isSelected)
        .forEach(([studentId]) => {
          promotionsByTarget[targetId].push(parseInt(studentId));
        });
    });
    
    // Verificar si hay estudiantes seleccionados
    const totalStudents = Object.values(promotionsByTarget)
      .reduce((total, ids) => total + ids.length, 0);
      
    if (totalStudents === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Ningún estudiante seleccionado',
        text: 'No hay estudiantes seleccionados para promover',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Procesar cada grupo de destino por separado
      const promotionPromises = Object.entries(promotionsByTarget).map(([targetId, studentIds]) => {
        if (studentIds.length === 0) return Promise.resolve();
        
        const promotionData = {
          studentIds: studentIds,
          targetGroupId: parseInt(targetId),
          promotionStatus: "A"  // Por defecto promover como Activo
        };
        
        return studentAdminService.promoteStudents(promotionData);
      });
      
      // Esperar a que todas las promociones se completen
      await Promise.all(promotionPromises);
      
      Swal.fire({
        icon: 'success',
        title: '¡Promoción masiva exitosa!',
        text: `${totalStudents} estudiantes han sido promovidos exitosamente`,
        confirmButtonColor: '#F59E0B'
      });
      
      // Recargar datos después de la promoción
      const studentsByGroups = await studentAdminService.getStudentsByGroups();
      const activeGroups = await studentAdminService.getActiveGroups();
      
      // Organizar estudiantes por grupo
      const groupedData = groupStudentsByGroup(studentsByGroups);
      
      // Procesar datos
      const processedGroups = processGroupData(groupedData, activeGroups);
      setGroups(processedGroups);
      
      // Reiniciar selecciones
      const initialSelectedState = {};
      processedGroups.forEach(group => {
        initialSelectedState[group.id] = {};
        group.students.forEach(student => {
          initialSelectedState[group.id][student.id] = student.status === "A";
        });
      });
      setSelectedStudents(initialSelectedState);
      
    } catch (error) {
      console.error("Error al promover estudiantes:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error en la promoción masiva',
        text: 'No se pudieron promover los estudiantes. Por favor, intente nuevamente.',
        confirmButtonColor: '#F59E0B'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar estudiantes según el estado de promoción
  const getFilteredStudents = (group) => {
    if (showOnlyPromotable) {
      return group.students.filter(student => student.status === 'A');
    }
    return group.students;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Promoción de Estudiantes
        </h2>
        
        <div className="flex items-center bg-gray-100 p-2 rounded-lg">
          <input 
            type="checkbox" 
            id="selectActiveStudents" 
            className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
            checked={showOnlyPromotable}
            onChange={() => setShowOnlyPromotable(!showOnlyPromotable)}
          />
          <label htmlFor="selectActiveStudents" className="ml-2 block text-sm text-gray-700 font-medium">
            Mostrar solo estudiantes activos
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mb-4"></div>
          <span className="text-gray-600 font-medium">Cargando datos de estudiantes...</span>
        </div>
      ) : (
        <>
          {groups.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No hay grupos disponibles</h3>
              <p className="text-gray-500">No se encontraron grupos con estudiantes para promoción</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div 
                    className="flex items-center bg-gray-50 px-5 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleGroupExpansion(group.id)}
                  >
                    <motion.div
                      animate={{ rotate: expandedGroups[group.id] ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                      className="mr-3"
                    >
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                        <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {group.level}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 mt-1">
                        {getFilteredStudents(group).length} estudiantes {showOnlyPromotable ? "activos" : ""}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Promover a</span>
                      <div className="relative">
                        <select 
                          className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          value={targetGroups[group.id] || ""}
                          onChange={(e) => handleTargetGroupChange(group.id, e.target.value)}
                        >
                          <option value="">Seleccionar grupo</option>
                          {group.possibleTargetGroups && group.possibleTargetGroups.map(targetGroup => (
                            <option key={targetGroup.id} value={targetGroup.id}>
                              {targetGroup.groupName} - {targetGroup.level.levelName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {expandedGroups[group.id] && (
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id={`select-all-${group.id}`} 
                            className="h-5 w-5 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                            onChange={(e) => toggleAllStudentsInGroup(group.id, e.target.checked)}
                            checked={
                              getFilteredStudents(group).length > 0 &&
                              getFilteredStudents(group).every(student => 
                                selectedStudents[group.id][student.id]
                              )
                            }
                          />
                          <label htmlFor={`select-all-${group.id}`} className="ml-2 font-medium text-gray-700">
                            Seleccionar todos
                          </label>
                        </div>
                        
                        <button 
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium rounded-md transition-colors flex items-center shadow-sm"
                          onClick={() => promoteStudentsFromGroup(group.id)}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900 mr-2"></div>
                              <span>Procesando...</span>
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-4 w-4 mr-2" />
                              <span>Promover Seleccionados</span>
                            </>
                          )}
                        </button>
                      </div>

                      {getFilteredStudents(group).length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <UserCheck className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">
                            No hay estudiantes {showOnlyPromotable ? "activos" : ""} en este grupo
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {getFilteredStudents(group).map((student, index) => {
                            const statusInfo = getStatusLabel(student.status, student.promotionStatus);
                            return (
                              <div 
                                key={student.id} 
                                className={`flex items-center p-3 rounded-lg border ${statusInfo.bgColor} hover:shadow-sm transition-shadow`}
                              >
                                <div className="flex items-center mr-3">
                                  <input 
                                    type="checkbox" 
                                    id={`student-${student.id}`} 
                                    className="h-5 w-5 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                                    checked={selectedStudents[group.id][student.id] || false}
                                    onChange={() => toggleStudentSelection(group.id, student.id)}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-800">
                                    {student.name}
                                  </div>
                                  <div className={`flex items-center text-sm ${statusInfo.color} mt-1`}>
                                    <statusInfo.icon className="h-4 w-4 mr-1" />
                                    <span>{statusInfo.text}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-8 flex justify-center">
                <button 
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium rounded-lg transition-colors flex items-center shadow-md"
                  onClick={promoteAllActiveStudents}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900 mr-3"></div>
                      <span>Procesando promoción masiva...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5 mr-3" />
                      <span>Promover Todos los Estudiantes Seleccionados</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PromotionsTab;
