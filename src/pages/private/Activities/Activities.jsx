import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { studentDataService } from "../Dashboard/StudentLayout";
import { configViewService } from "../Setting";
import ActivityModal from "./ActivityModal";
import { BackButton } from "../../../components";
import { useNavigate } from "react-router-dom";
import { subjectActivityService } from "../Subject";
import SubjectHeader from "../Subject/SubjectHeader";
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText
} from "lucide-react";
import { PrivateRoutes } from "../../../models";

export default function Activities() {
  const [activities, setActivities] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const navigate = useNavigate();

  const userState = useSelector((store) => store.selectedUser);

  useEffect(() => {
    const periodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
    return () => periodSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedPeriod || !userState.id) return;
    const fetchAllTasks = async () => {
      const tasksData = await studentDataService.getAllActivities(selectedPeriod, userState.id);
      
      // Agrupar actividades por materia usando el campo "subject"
      const groupedActivities = tasksData.reduce((acc, activity) => {
        // Usar el nombre de la materia directamente del campo "subject"
        const subjectName = activity.subject || 'Sin Materia';
        
        if (!acc[subjectName]) {
          acc[subjectName] = {
            subjectName: subjectName,
            activities: []
          };
        }
        acc[subjectName].activities.push(activity);
        return acc;
      }, {});
      
      setActivities(groupedActivities);
    };

    fetchAllTasks();
  }, [selectedPeriod, userState]);

  const handleActivityClick = async (activityId) => {
    const activityData = await studentDataService.getActivityDetailsStudent(activityId, userState.id);
    if (activityData) subjectActivityService.openTaskModal(activityData);
  };

  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // Función para obtener el estado de la actividad con color
  const getStatusBadge = (status, endDate) => {
    const now = new Date();
    const dueDate = new Date(endDate);
    
    // Verificar si está vencida
    const isOverdue = now > dueDate && status !== "COMPLETED" && status !== "A";
    
    if (isOverdue) {
      return (
        <span className="flex items-center gap-1 bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full">
          <XCircle className="w-3 h-3" />
          <span>Vencida</span>
        </span>
      );
    }
    
    switch(status?.toUpperCase()) {
      case "COMPLETED":
      case "A":
        return (
          <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completada</span>
          </span>
        );
      case "IN_PROGRESS":
      case "P":
        return (
          <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span>En progreso</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full">
            <AlertCircle className="w-3 h-3" />
            <span>Pendiente</span>
          </span>
        );
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Calcular estadísticas generales
  const calculateStats = () => {
    let totalActivities = 0;
    let completedActivities = 0;
    let pendingActivities = 0;
    let overdueActivities = 0;
    
    console.log("Activities:", activities);

    Object.values(activities).forEach(subject => {
      subject.activities.forEach(activity => {
        totalActivities++;
        
        const now = new Date();
        const dueDate = new Date(activity.endDate);
        const isOverdue = now > dueDate && activity.status !== "COMPLETED" && activity.status !== "A";
        
        if (activity.status === "COMPLETED" || activity.status === "A") {
          completedActivities++;
        } else if (isOverdue) {
          overdueActivities++;
        } else {
          pendingActivities++;
        }
      });
    });
    
    return {
      total: totalActivities,
      completed: completedActivities,
      pending: pendingActivities,
      overdue: overdueActivities
    };
  };
  
  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <SubjectHeader
        isTeacher={false}
        subjectName="Mis Actividades"
        customActionContent={
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-600 font-medium">Periodo Actual</p>
                  <p className="text-lg font-bold text-blue-700">{selectedPeriod || '-'}</p>
                </div>
              </div>
            </div>
            
            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                <p className="text-xs text-indigo-600 font-medium">Total</p>
                <p className="text-lg font-bold text-indigo-700">{stats.total}</p>
              </div>
              <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                <p className="text-xs text-green-600 font-medium">Completadas</p>
                <p className="text-lg font-bold text-green-700">{stats.completed}</p>
              </div>
              <div className="bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Pendientes</p>
                <p className="text-lg font-bold text-amber-700">{stats.pending}</p>
              </div>
              <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                <p className="text-xs text-red-600 font-medium">Vencidas</p>
                <p className="text-lg font-bold text-red-700">{stats.overdue}</p>
              </div>
            </div>
          </div>
        }
      />

      {/* Lista de Materias con Actividades */}
      <div className="space-y-4">
        {Object.entries(activities).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <FileText className="w-12 h-12 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500">No hay actividades disponibles</h3>
              <p className="text-sm text-gray-400">
                No se encontraron actividades para el periodo actual
              </p>
            </div>
          </div>
        ) : (
          Object.entries(activities).map(([subjectName, subjectData]) => (
            <div key={subjectName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Cabecera de la Materia */}
              <div
                onClick={() => toggleSubject(subjectName)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{subjectData.subjectName}</h3>
                  <span className="bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full">
                    {subjectData.activities.length} actividades
                  </span>
                </div>
                {expandedSubjects[subjectName] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>

              {/* Lista de Actividades */}
              {expandedSubjects[subjectName] && (
                <div className="border-t border-gray-200">
                  <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 text-sm font-medium text-gray-600">
                    <div className="col-span-3 md:col-span-4">Actividad</div>
                    <div className="col-span-3 md:col-span-3 hidden md:block">Descripción</div>
                    <div className="col-span-3 md:col-span-2 text-center">Estado</div>
                    <div className="col-span-3 md:col-span-1 text-center">Fecha</div>
                    <div className="col-span-3 md:col-span-2 text-center">Nota</div>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {subjectData.activities.map((activity) => (
                      <div
                        key={activity.id}
                        onClick={() => handleActivityClick(activity.id)}
                        className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer items-center"
                      >
                        <div className="col-span-3 md:col-span-4">
                          <p className="font-medium text-gray-800">{activity.name}</p>
                          <p className="text-xs text-gray-500 md:hidden mt-1 line-clamp-1">{activity.description}</p>
                        </div>
                        <div className="col-span-3 md:col-span-3 text-gray-600 text-sm hidden md:block">
                          <p className="line-clamp-2">{activity.description}</p>
                        </div>
                        <div className="col-span-3 md:col-span-2 flex justify-center">
                          {getStatusBadge(activity.status, activity.endDate)}
                        </div>
                        <div className="col-span-3 md:col-span-1 text-center text-xs text-gray-600">
                          {formatDate(activity.endDate)}
                        </div>
                        <div className="col-span-3 md:col-span-2 text-center">
                          <span className={`inline-block font-medium px-3 py-1 rounded-full ${
                            activity.score >= 3 
                              ? 'bg-green-50 text-green-600' 
                              : activity.score === '-' 
                                ? 'bg-gray-50 text-gray-600'
                                : 'bg-red-50 text-red-600'
                          }`}>
                            {activity.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <BackButton onClick={() => navigate(PrivateRoutes.DASHBOARD)} />
      <ActivityModal />
    </div>
  );
}
