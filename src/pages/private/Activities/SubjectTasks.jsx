import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { studentService, studentDataService } from "../Dashboard/StudentLayout/StudentService";
import { BackButton } from "../../../components";
import { configViewService } from "../Setting";
import { comment } from "postcss";

export default function SubjectTasks() {
  const [tasks, setTasks] = useState([]);
  const [periodGrade, setPeriodGrade] = useState("-");
  const selectedSubject = sessionStorage.getItem("selectedSubject");
  const userState = useSelector(store => store.user);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  
  useEffect(() => {
      const selectedPeriodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
      return () => selectedPeriodSubscription.unsubscribe();
    }, []);



// Ejemplo de tarea para probar el modal
const sampleTask = {
  id: 1,
  name: "Sumemos y Restemos con Diversión",
  description: `Hoy vamos a practicar la suma y la resta con algunos ejercicios divertidos. Resuelve los siguientes problemas usando tus habilidades matemáticas. Puedes dibujar, usar tus dedos o fichas para ayudarte.

Instrucciones:
1. Resuelve las siguientes sumas y restas:
   • 12 + 5 = ___
   • 20 - 8 = ___
   • 7 + 9 = ___
   • 15 - 6 = ___

2. Escribe un problema de suma o resta y pídele a un amigo o familiar que lo resuelva.
1. Resuelve las siguientes sumas y restas:
   • 12 + 5 = ___
   • 20 - 8 = ___
   • 7 + 9 = ___
   • 15 - 6 = ___

2. Escribe un problema de suma o resta y pídele a un amigo o familiar que lo resuelva.1. Resuelve las siguientes sumas y restas:
   • 12 + 5 = ___
   • 20 - 8 = ___
   • 7 + 9 = ___
   • 15 - 6 = ___

2. Escribe un problema de suma o resta y pídele a un amigo o familiar que lo resuelva.1. Resuelve las siguientes sumas y restas:
   • 12 + 5 = ___
   • 20 - 8 = ___
   • 7 + 9 = ___
   • 15 - 6 = ___

2. Escribe un problema de suma o resta y pídele a un amigo o familiar que lo resuelva.
3. Dibuja un ejemplo de una suma o una resta usando objetos (como manzanas, juguetes o pelotas).`,
  startDate: "2024-01-15T00:00:00",
  endDate: "2024-01-21T23:59:59",
  status: "Entrega Lunes 21 de enero",
  score: "-",
  subjectName: "Matemáticas",
  comment: "Sin estado",
  activity: {
    activityName: "Sumemos y Restemos con Diversión",
    subject: {
      subjectName: "Matemáticas"
    }
  }
};

  useEffect(() => {
    if (!selectedSubject || !selectedPeriod || !userState.id) return;

    // 🔹 Obtener la nota del periodo
    const fetchPeriodGrade = async () => {
      const grade = await studentDataService.getPeriodGrade(selectedSubject, selectedPeriod, userState.id);
      setPeriodGrade(grade);
    };

    // 🔹 Obtener las tareas de la materia
    const fetchTasks = async () => {
      const taskData = await studentDataService.getTasks(selectedSubject, selectedPeriod, userState.id);
      setTasks(taskData);
    };

    

    fetchPeriodGrade();
    fetchTasks();
  }, [selectedPeriod, selectedSubject, userState]);

  // 🔹 Obtener los detalles de la tareas de la materia
  const fetchActivityDetail = async (taskId) => {
    return await studentDataService.getTaskDetails(taskId);
    
  };

  const handleTaskClick = async(taskId) => {
    const taskData = await fetchActivityDetail(taskId); 
    console.log(taskData);
    if (taskData) studentService.openTaskModal(taskData); 
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-200 rounded-full p-4">
        <div className="flex items-center space-x-4 flex-1">
          <span className="font-medium text-gray-800 px-4">
            {tasks.length > 0 ? tasks[0].subjectName : "Materia"}
          </span>
          <div className="bg-gray-300 px-4 py-1 rounded-full">
            <span className="text-sm text-gray-700">
              Nota del periodo: {periodGrade}
            </span>
          </div>
        </div>
        <BackButton onClick={() => studentService.setView("home")} />
      </div>

      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-gray-600 border-b border-gray-200">
          <div className="col-span-4">Tarea</div>
          <div className="col-span-4">Descripción</div>
          <div className="col-span-2 text-center">Entrega</div>
          <div className="col-span-2 text-center">Nota</div>
        </div>

        <div className="divide-y divide-gray-200">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
              key={task.id}
              onClick={() => handleTaskClick(task.id)}
              className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-200 transition-colors items-center cursor-pointer"
              >
                <div className="col-span-4 font-medium text-gray-700">{task.name}</div>
                <div className="col-span-4 text-gray-600">{task.description}</div>
                <div className="col-span-2 text-center text-gray-600">
                  {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                </div>
                <div className="col-span-2 text-center font-medium text-gray-700">
                  {task.score}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center p-4">No hay tareas disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
}
