import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { studentDataService } from "../Dashboard/StudentLayout";
import { configViewService } from "../Setting";
import ActivityModal from "./ActivityModal";
import { BackButton } from "../../../components";
import { useNavigate } from "react-router-dom";
import { subjectTaskService } from "../Subject";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const navigate = useNavigate();

  const userState = useSelector((store) => store.selectedUser);

  useEffect(() => {
    // 🔹 Suscripción al período seleccionado
    const periodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);

    return () => {
      periodSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectedPeriod || !userState.id) return;

    // 🔹 Obtener todas las tareas del estudiante en el periodo seleccionado
    const fetchAllTasks = async () => {
      const tasksData = await studentDataService.getAllActivities(selectedPeriod, userState.id);
      
      setActivities(tasksData);
    };

    fetchAllTasks();
  }, [selectedPeriod, userState]);

  const handleActivityClick = async (activityId) => {
    const activityData = await studentDataService.getActivityDetailsStudent(activityId,userState.id);
    if (activityData) subjectTaskService.openTaskModal(activityData)
  };

  return (
    <div className="space-y-4">
      {/* 🔹 Encabezado */}
      <div className="flex items-center justify-between gap-20">
        <div className="flex items-center gap-10 flex-1 bg-gray-200 rounded-full p-4">
          <span className="font-medium text-gray-800 px-4">
            {studentDataService.getStudentDataValue()?.group?.groupName || "Rol"}
          </span>
          <div className="bg-gray-300 px-4 py-1 rounded-full">
            <span className="text-sm text-gray-700">Periodo {selectedPeriod}</span>
          </div>
        </div>
      </div>

      {/* 🔹 Tabla de Actividades */}
      <div className="bg-gray-100 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
        <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-gray-600 border-b border-gray-200">
          <div className="col-span-4">Tarea</div>
          <div className="col-span-4">Descripción</div>
          <div className="col-span-2 text-center">Estado</div>
          <div className="col-span-2 text-center">Nota</div>
        </div>

        <div className="divide-y divide-gray-200">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => handleActivityClick(activity.id)}
                className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-300 
                transition-colors items-center cursor-pointer rounded-lg 
                bg-gray-200 m-2"
              >
                <div className="col-span-4 font-medium text-gray-700">{activity.name}</div>
                <div className="col-span-4 text-gray-600">{activity.description}</div>
                <div className="col-span-2 text-center text-gray-600">
                  {activity.status}
                </div>
                <div className="col-span-2 text-center font-medium text-gray-700">
                  {activity.score}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center p-4">No hay actividades disponibles.</p>
          )}
        </div>
      </div>

      <BackButton onClick={() => navigate("/dashboard")} />
      <ActivityModal/>
      
    </div>
  );
}
