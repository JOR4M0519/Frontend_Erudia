import { Routes, Route, Navigate } from "react-router-dom";
import { HomeStudent, studentDataService, teacherDataService } from "./index";
import { ActivityModal, SubjectActivities} from "../../Activities";
import { useSelector } from "react-redux";
import { useEffect } from "react";

import { AsistanceGrid, DirectionGroupsGrid } from "../TeacherLayout";
import { PrivateRoutes } from "../../../../models";

export default function StudentLayout() {
  const userState = useSelector(store => store.selectedUser); // Obtener el usuario del store

  useEffect(() => {
    if (!userState?.id) return; // No ejecuta si no hay usuario
    studentDataService.fetchStudentData(userState.id);
  }, [userState?.id]);
 
  // Divide la URL en segmentos y elimina los vacíos
  const pathSegments = window.location.pathname.split("/").filter(Boolean); // Filtra vacíos
  
  // `filter(Boolean)` elimina los valores vacíos del array.
  // Si hay más de un segmento, elimina el último (mantiene la ruta base)
  // `slice(0, -1)` elimina el último segmento de la URL.
  // Si solo hay un segmento, lo mantiene (evita que se rompa en `/dashboard`).
  const baseRoute = pathSegments.length > 1 ? pathSegments.slice(0, -1).join("/") : pathSegments[0] || "";


  return (
    <div className="space-y-6 p-6">
      <Routes>
        {/* Redirige a `home` por defecto */}
        <Route path="/" element={<Navigate to={`/${baseRoute}${PrivateRoutes.HOME}`} />} />
        <Route path={PrivateRoutes.HOME} element={<HomeStudent />} />
        <Route path={PrivateRoutes.ACTIVITIES_SUBJECT} element={<SubjectActivities />} />
        <Route path={PrivateRoutes.ASISTANCE} element={<AsistanceGrid />} />
      </Routes>
      <ActivityModal /> 
    </div>
  );
}
