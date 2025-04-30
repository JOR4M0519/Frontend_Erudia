import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { decodeRoles } from "../../../../utilities";
import { PrivateRoutes, Roles } from "../../../../models";
import { GradesStudent, HomeStudent, teacherDataService } from "../StudentLayout";
import { ActivitiesGrading, ActivityModal, SubjectActivities} from "../../Activities";
import { AsistanceGrid, DirectionGroupsGrid } from ".";
import { SystemUsers } from "../../Admin/System";

export default function TeacherLayout() {
  const userState = useSelector(store => store.selectedUser);
  const storedRoles = decodeRoles(userState?.roles) || [];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userState?.id) return;
    
    setIsLoading(true);
    
    // Obtener el año actual
    const currentYear = new Date().getFullYear();
    
    // Iniciar la carga de datos y manejar la finalización
    const loadData = async () => {
      try {
        await teacherDataService.fetchGroupsData(userState.id, currentYear);
      } catch (error) {
        console.error("Error al cargar datos del profesor:", error);
      } finally {
        // Siempre desactivar el estado de carga cuando termine, ya sea con éxito o error
        setIsLoading(false);
      }
    };
    
    loadData();
    
  }, [userState?.id]);
  
  // Divide la URL en segmentos y elimina los vacíos
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const baseRoute = pathSegments.length > 1 ? pathSegments.slice(0, -1).join("/") : pathSegments[0] || "";

  // Verificar los roles del usuario seleccionado
  const hasTeacherRole = storedRoles.includes(Roles.TEACHER);
  const hasStudentRole = storedRoles.includes(Roles.STUDENT);
  
  // Mostrar pantalla de carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-medium text-gray-700">Cargando tu información</h3>
        <p className="text-gray-500 mt-2">Estamos preparando tus datos...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      <Routes>
        {/* Redirige a `home` por defecto */}
        <Route path="/" element={<Navigate to={`/${baseRoute}${PrivateRoutes.HOME}`} />} />
        <Route path={PrivateRoutes.HOME} element={<HomeStudent />} />
        
        {/* Rutas comunes o que pueden ser accedidas por estudiantes */}
        <Route path={PrivateRoutes.ACTIVITIES_SUBJECT} element={<SubjectActivities />} />
        <Route path={PrivateRoutes.ASISTANCE} element={<AsistanceGrid />} />
        
        {/* Rutas que requieren rol de profesor */}
        {hasTeacherRole && (
          <>
            <Route path={PrivateRoutes.ACTIVITIES_GRADING} element={<ActivitiesGrading />} />
            <Route path={PrivateRoutes.DIRECTOR_GROUP_SUBJECTS} element={<DirectionGroupsGrid />} />
          </>
        )}
        
        {/* Rutas que requieren rol de estudiante */}
        {hasStudentRole && (
          <Route path={PrivateRoutes.GRADES} element={<GradesStudent />} />
        )}
        
      </Routes>
      <ActivityModal /> 
    </div>
  );
}
