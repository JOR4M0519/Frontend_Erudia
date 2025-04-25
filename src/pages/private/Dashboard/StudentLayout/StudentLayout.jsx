import { Routes, Route, Navigate } from "react-router-dom";
import { GradesStudent, HomeStudent, studentDataService, teacherDataService } from "./index";
import { ActivityModal, SubjectActivities} from "../../Activities";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { decodeRoles } from "../../../../utilities";
import { AsistanceGrid, DirectionGroupsGrid } from "../TeacherLayout";
import { PrivateRoutes, Roles } from "../../../../models";
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
    Swal.fire({
      title: 'Cargando datos...',
      text: 'Obteniendo información del estudiante',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    
    // Llamar al servicio
    studentDataService.fetchStudentData(userState.id, selectedPeriod)
      .then(() => {
        // Cerrar el modal cuando termina
        setIsLoading(false);
        Swal.close();
      })
      .catch(error => {
        setIsLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos del estudiante',
          timer: 2000
        });
      });
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
