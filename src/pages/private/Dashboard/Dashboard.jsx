import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { decodeRoles } from "../../../utilities";
import { Roles, AdminRoutes, PrivateRoutes } from "../../../models";
import { Layout } from "../../../components";
import { studentDataService, StudentLayout } from "./StudentLayout";
import { configViewService } from "../Setting";
import { TeacherLayout } from "./TeacherLayout";
import { Admin } from "../Admin";
import { Navigate, useLocation } from "react-router-dom";
import TokenRefreshAlert from "../../../services/config/token_helper";


// Create a simple flag to track if the user has explicitly chosen to view as user
// This could be enhanced with localStorage or Redux for persistence
let userChosenViewMode = null;

export default function Dashboard() {
  const selectedUser = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(selectedUser.roles) || [];
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const location = useLocation();

  //  Suscribirse a los períodos disponibles
  useEffect(() => {
    const periodSubscription = configViewService.getPeriods().subscribe(setPeriods);
    return () => periodSubscription.unsubscribe();
  }, []);

  //  Suscribirse al período seleccionado
  useEffect(() => {
    const selectedPeriodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
    return () => selectedPeriodSubscription.unsubscribe();
  }, []);

  //  Cargar períodos al montar el componente
  useEffect(() => {
    configViewService.loadPeriods();
  }, []);

  // Detect if we're coming from a user view choice in the sidebar
  useEffect(() => {
    // If we're at the dashboard root and not in admin route, it might be a user choice
    if (location.pathname === PrivateRoutes.DASHBOARD) {
      userChosenViewMode = "default";
    }
    // If we're in an admin route, update the tracking
    else if (location.pathname.startsWith(AdminRoutes.ROOT)) {
      userChosenViewMode = "admin";
    }
  }, [location.pathname]);

  // Si el usuario es administrador y no ha elegido explícitamente ver como usuario,
  // redirigirlo automáticamente al panel de administración
  if (storedRole.includes(Roles.ADMIN)) {
    // Verificar si estamos en una ruta de administración
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    // Si no estamos en una ruta de administración Y el usuario no ha elegido ver como usuario,
    // redirigir al panel de administración
    if (!isAdminRoute && userChosenViewMode !== "default") {
      return <Navigate to={AdminRoutes.INSTITUTION} replace />;
    }
    
    // Si ya estamos en una ruta de administración, mostrar el componente Admin
    if (isAdminRoute) {
      return (
      <>
        <TokenRefreshAlert />
        <Admin />
      </>
      )
     
    }
  }
  
  // Renderizar el layout correspondiente según el rol del usuario
  if (storedRole.includes(Roles.STUDENT)) {
    return (
    <>
      <TokenRefreshAlert />
      <StudentLayout />
    </>
    )
  }
  
  if (storedRole.includes(Roles.TEACHER)) {
    return (
      <>
      <TokenRefreshAlert />
      <TeacherLayout />
    </> 
    )
    
  }

  // Si no hay un rol específico, mostrar el layout de estudiante por defecto
  return (
  <>
    <TokenRefreshAlert />
    <StudentLayout />
  </>
  )
  
}