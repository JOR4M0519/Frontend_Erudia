import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { request } from "../../../../services/config/axios_helper";
import { HomeStudent, studentDataService,  studentService } from "./index";
import { StudentGroupModel } from "../../../../models/index";
import { SubjectTasks } from "../../Activities";
import { ActivityModal } from "../../Activities";

export default function StudentLayout() {
  const [view, setView] = useState("home"); // Estado local para la vista
  const userState = useSelector(store => store.selectedUser); // Obtener el usuario del store
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const subscription = studentDataService.getStudentData().subscribe(setStudentData);
    return () => subscription.unsubscribe(); 
  }, []);

  useEffect(() => {
    if (userState?.id) {
      studentDataService.fetchStudentData(userState.id);
    }
  }, [userState]);

  useEffect(() => {
    // Suscribirse al servicio de vistas
    const subscription = studentService.getView().subscribe(setView);
    return () => subscription.unsubscribe(); // Limpiar suscripción
  }, []);



  return (
    <>
      <div className="space-y-6 p-6">
        {view === "subjectTasks" && <SubjectTasks/>}
        {view === "home" && <HomeStudent />}
        <ActivityModal /> 
      </div>
    </>
    
  );
}

