import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { request } from "../../../../services/config/axios_helper";
import { GradesStudent, HomeStudent, studentDataService, StudentHeader, studentService } from "./index";
import { StudentGroupModel } from "../../../../models/index";
import SubjectTasks from "../../Activities/SubjectTasks";
import ActivityModal from "../../Activities/ActivityModal";

export default function StudentLayout() {
  const [view, setView] = useState("home"); // Estado local para la vista
  const userState = useSelector(store => store.user);

  useEffect(() => {
    const dataStudent = async () => {

      if (!sessionStorage.getItem("studentData")) {
        const dataSubjectsAcademy = async () => {
          try {
            //  1. Obtener datos del grupo del estudiante
            const responseGroups = await request("GET", "academy", `/student-groups/user/${userState.id}`, {});
            if (responseGroups.status === 200 && responseGroups.data.length > 0) {
              //  Convertimos el JSON en una instancia del modelo
              console.log(responseGroups.data[0]);
              const studentGroup = new StudentGroupModel(responseGroups.data[0]); 
              
      
              //  2. Obtener materias basadas en el grupo
              const responseSubjects = await request("GET", "academy", `/subjects-groups/students-groups/${studentGroup.group.id}`, {});
              if (responseSubjects.status === 200) {
                //  3. Agregar las materias al modelo
                studentGroup.addSubjects(responseSubjects.data);
        
                //  4. Guardar en sessionStorage y actualizar RxJS
                studentDataService.setSubjects(studentGroup.toJSON());
        
              }
            }
          } catch (error) {
            console.error("Error durante la carga de materias:", error);
          }
        };
      
        dataSubjectsAcademy(); // Llamar a la función
      }

    
  };
    dataStudent();
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
