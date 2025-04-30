import { Routes, Route, Navigate } from "react-router-dom";
import { GradesStudent, HomeStudent, studentDataService, teacherDataService } from "./index";
import { ActivityModal, SubjectActivities} from "../../Activities";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { decodeRoles } from "../../../../utilities";
import { AsistanceGrid, DirectionGroupsGrid } from "../TeacherLayout";
import { PrivateRoutes, Roles } from "../../../../models";
import { SystemUsers } from "../../Admin/System";
import { configViewService } from "../../Setting";
import Swal from 'sweetalert2'; // Importar SweetAlert2

export default function StudentLayout() {
  const userState = useSelector(store => store.selectedUser); // Obtener el usuario del store
  const storedRoles = decodeRoles(userState?.roles) || [];
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const selectedPeriodSubscription = configViewService
      .getSelectedPeriod()
      .subscribe(setSelectedPeriod);
    return () => selectedPeriodSubscription.unsubscribe();
  }, [userState?.id, selectedPeriod]);

  useEffect(() => {
    if (!userState?.id || !selectedPeriod) return; // No ejecuta si no hay usuario o periodo
    
    // Mostrar el indicador de carga
    setIsLoading(true);
    
    // Llamar al servicio
    const loadData = async () => {
      try {
        await studentDataService.fetchStudentData(userState.id, selectedPeriod);
      } catch (error) {
        console.error("Error al cargar datos del estudiante:", error);
      } finally {
        // Siempre desactivar el estado de carga cuando termine
        setIsLoading(false);
      }
    };
    
    loadData();
    
  }, [userState?.id, selectedPeriod]);
  // Divide la URL en segmentos y elimina los vacíos
  const pathSegments = window.location.pathname.split("/").filter(Boolean); // Filtra vacíos
  
  // `filter(Boolean)` elimina los valores vacíos del array.
  // Si hay más de un segmento, elimina el último (mantiene la ruta base)
  // `slice(0, -1)` elimina el último segmento de la URL.
  // Si solo hay un segmento, lo mantiene (evita que se rompa en `/dashboard`).
  const baseRoute = pathSegments.length > 1 ? pathSegments.slice(0, -1).join("/") : pathSegments[0] || "";

  // Verificar si el usuario tiene rol de estudiante para mostrar las rutas correspondientes
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
        
        {/* Rutas que requieren rol de estudiante */}
        {hasStudentRole && (
          <>
            <Route path={PrivateRoutes.ACTIVITIES_SUBJECT} element={<SubjectActivities />} />
            <Route path={PrivateRoutes.GRADES} element={<GradesStudent />} />
          </>
        )}
        
        {/* Rutas comunes o que requieren otros roles */}
        <Route path={PrivateRoutes.ASISTANCE} element={<AsistanceGrid />} />
        
      </Routes>
      
      <ActivityModal /> 
    </div>
  );
}
