import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { request } from "../../../../services/config/axios_helper";
import { GradesStudent, HomeStudent, studentDataService, StudentHeader, studentService } from "./index";
import { StudentGroupModel } from "../../../../models/index";
import SubjectTasks from "../../Activities/SubjectTasks";

export default function StudentLayout() {
  const [selectedPeriod, setSelectedPeriod] = useState("1");
  const [view, setView] = useState("home"); // Estado local para la vista
  const [periods, setPeriods] = useState([]);
  const userState = useSelector(store => store.user);

  useEffect(() => {
    const dataStudent = async () => {

      if (!sessionStorage.getItem("studentData")) {
        const dataSubjectsAcademy = async () => {
          try {
            // 🔹 1. Obtener datos del grupo del estudiante
            const responseGroups = await request("GET", "academy", `/student-groups/user/${userState.id}`, {});
            if (responseGroups.status === 200 && responseGroups.data.length > 0) {
              // 🔹 Convertimos el JSON en una instancia del modelo
              const studentGroup = new StudentGroupModel(responseGroups.data[0]); 
              
      
              // 🔹 3. Obtener materias basadas en el grupo
              const responseSubjects = await request("GET", "academy", `/subjects-groups/students-groups/${studentGroup.group.id}`, {});
              if (responseSubjects.status === 200) {
                // 🔹 3. Agregar las materias al modelo
                studentGroup.addSubjects(responseSubjects.data);
        
                // 🔹 4. Guardar en sessionStorage y actualizar RxJS
                studentDataService.setSubjects(studentGroup.toJSON());
        
              }
            }
          } catch (error) {
            console.error("Error durante la carga de materias:", error);
          }
        };
      
        dataSubjectsAcademy(); // Llamar a la función
      }

    const dataPeriodAcademy = async () => {
      let year = new Date().getFullYear();
      try {
        const response = await request("GET", "academy", `/periods/active/${year}`, {});
        if (response.status === 200) {
          setPeriods(response.data); // Guardamos los periodos disponibles

          // Seleccionamos el primer periodo por defecto
          setSelectedPeriod(response.data[0].id);
        }
      } catch (error) {
        console.error("Error durante la carga de datos:", error);
      }
    }
    dataPeriodAcademy();
  };
    dataStudent();
    // Suscribirse al servicio de vistas
    const subscription = studentService.getView().subscribe(setView);
    return () => subscription.unsubscribe(); // Limpiar suscripción
  }, []);



  return (
    <div className="space-y-6 p-6">
      <StudentHeader 
        selectedPeriod={selectedPeriod} 
        setSelectedPeriod={setSelectedPeriod}
        periods={periods} 
      />

      {view === "grades" && <GradesStudent selectedPeriod={selectedPeriod} />}
      {view === "subjectTasks" && <SubjectTasks selectedPeriod={selectedPeriod} />}
      {view === "home" && <HomeStudent />}
    </div>
  );
}
