import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { teacherDataService } from "../Dashboard/StudentLayout/StudentService";
import { subjectActivityService } from "../Subject";
import { BackButton } from "../../../components";
import { useNavigate } from "react-router-dom";
import { StudentList } from "../Dashboard/TeacherLayout";
import { CheckSquare } from "lucide-react";

export default function ActivityGradingView() {
  const [tasks, setTasks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();
  const userState = useSelector(store => store.selectedUser);

  useEffect(() => {
    const subjectSubscription = subjectActivityService.getSelectedSubject().subscribe((subjectString) => {
      if (subjectString) {
        setSelectedSubject(JSON.parse(subjectString));
      }
    });

    return () => subjectSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedSubject?.id || !userState?.id) return;

    const fetchActivities = async () => {
      try {
        const taskData = await teacherDataService.getActivities(
          selectedSubject.id,
          null, // No necesitamos periodo aquí
          selectedSubject?.group?.id,
          userState.id,
          true
        );
        setTasks(Array.isArray(taskData) ? taskData : []);
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    };

    fetchActivities();
  }, [selectedSubject?.id, userState?.id]);

  return (
    <div className="space-y-6">
      {/* 🔹 Header con nombre de la materia */}
      <div className="flex items-center justify-between gap-10">
        <div className="flex items-center gap-10 flex-1 bg-gray-200 rounded-full p-4">
          <span className="font-medium text-gray-800 px-4">
            {selectedSubject ? selectedSubject.subjectName : "Materia"}
          </span>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-gray-600 border-b border-gray-200">
          <div className="col-span-4">Tarea</div>
          <div className="col-span-4">Descripción</div>
          <div className="col-span-2 text-center">Entrega</div>
          <div className="col-span-2 text-center">Acción</div>
        </div>

        <div className="divide-y divide-gray-200">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id} className="bg-white">
                <div
                  onClick={() => navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITY_GRADING_DETAIL, { state: { task } })}
                  className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-200 transition-colors items-center cursor-pointer"
                >
                  <div className="col-span-4 font-medium text-gray-700">{task.name}</div>
                  <div className="col-span-4 text-gray-600">{task.description}</div>
                  <div className="col-span-2 text-center text-gray-600">
                    {new Date(task.startDate).toLocaleDateString()} -{" "}
                    {new Date(task.endDate).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button className="text-blue-600 hover:underline">Calificar</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center p-4">No hay actividades disponibles.</p>
          )}
        </div>
      </div>

      {/* 🔹 Lista de Estudiantes */}
      <div>
        <h3 className="text-xl font-bold text-gray-700">Lista de estudiantes</h3>
        <StudentList onStudentClick={(student) => console.log("Ver detalles de:", student)} />
      </div>

      <BackButton onClick={() => navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_GRADING)} />
    </div>
  );
}
