import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { decodeRoles } from "../../../../utilities";
import { PrivateRoutes, Roles } from "../../../../models";
import { GradesStudent, HomeStudent, teacherDataService } from "../StudentLayout";
import { ActivitiesGrading, ActivityModal, SubjectActivities} from "../../Activities";
import { AsistanceGrid, DirectionGroupsGrid } from ".";

export default function TeacherLayout() {
  const userState = useSelector(store => store.selectedUser); // Obtener el usuario del store
  const storedRoles = decodeRoles(userState?.roles) || [];

  useEffect(() => {
    if (!userState?.id) return; // No ejecuta si no hay usuario
    teacherDataService.fetchGroupsData(userState.id, new Date().getFullYear()); // Obtiene datos del profesor
  }, [userState?.id]);
  
  // Divide la URL en segmentos y elimina los vacíos
  const pathSegments = window.location.pathname.split("/").filter(Boolean); // Filtra vacíos
  
  // `filter(Boolean)` elimina los valores vacíos del array.
  // Si hay más de un segmento, elimina el último (mantiene la ruta base)
  // `slice(0, -1)` elimina el último segmento de la URL.
  // Si solo hay un segmento, lo mantiene (evita que se rompa en `/dashboard`).
  const baseRoute = pathSegments.length > 1 ? pathSegments.slice(0, -1).join("/") : pathSegments[0] || "";

  // Verificar los roles del usuario seleccionado
  const hasTeacherRole = storedRoles.includes(Roles.TEACHER);
  const hasStudentRole = storedRoles.includes(Roles.STUDENT);
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
