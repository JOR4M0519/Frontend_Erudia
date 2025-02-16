import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {studentService, studentDataService } from "../Dashboard/StudentLayout/StudentService";
import { BackButton } from "../../../components";

export default function SubjectTasks({ selectedPeriod }) {
  const [tasks, setTasks] = useState([]);
  const selectedSubject = sessionStorage.getItem("selectedSubject");
  const userState = useSelector(store => store.user);

  useEffect(() => {
    if (!selectedSubject || !selectedPeriod || !userState.id) return;

    const fetchTasks = async () => {
      const taskData = await studentDataService.getTasks(selectedSubject, selectedPeriod, userState.id);
      setTasks(taskData);
    };

    fetchTasks();
  }, [selectedPeriod, selectedSubject, userState]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-200 rounded-full p-2">
        <div className="flex items-center space-x-4 flex-1">
          <span className="font-medium text-gray-800 px-4">
            {tasks.length > 0 ? tasks[0].subjectName : "Materia"}
          </span>
          <div className="bg-gray-300 px-4 py-1 rounded-full">
            <span className="text-sm text-gray-700">
              Nota del periodo: {tasks.length > 0 ? tasks[0].periodGrade : "--"}
            </span>
          </div>
          <BackButton onClick={() => studentService.setView("home")} />
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-gray-600 border-b border-gray-200">
          <div className="col-span-5">Tarea</div>
          <div className="col-span-5">Estado</div>
          <div className="col-span-2 text-center">Nota</div>
        </div>

        <div className="divide-y divide-gray-200">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-200 transition-colors items-center"
              >
                <div className="col-span-5 font-medium text-gray-700">{task.name}</div>
                <div className="col-span-5 text-gray-600">{task.status}</div>
                <div className="col-span-2 text-center font-medium text-gray-700">{task.grade ?? "-"}</div>
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
