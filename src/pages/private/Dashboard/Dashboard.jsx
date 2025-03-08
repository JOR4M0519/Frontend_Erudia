import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { decodeRoles } from "../../../utilities";
import { Roles } from "../../../models";
import { Layout } from "../../../components";
import { studentDataService, StudentLayout } from "./StudentLayout";
import { configViewService } from "../Setting";
import { TeacherLayout } from "./TeacherLayout";
import { Admin } from "../Admin";

export default function Dashboard() {
  const selectedUser = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(selectedUser.roles) || [];
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);

  // 🔹 Suscribirse a los períodos disponibles
  useEffect(() => {
    const periodSubscription = configViewService.getPeriods().subscribe(setPeriods);
    return () => periodSubscription.unsubscribe();
  }, []);

  // 🔹 Suscribirse al período seleccionado
  useEffect(() => {
    const selectedPeriodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
    return () => selectedPeriodSubscription.unsubscribe();
  }, []);

  // 🔹 Cargar períodos al montar el componente
  useEffect(() => {
    configViewService.loadPeriods();
  }, []);

  // Renderizar el layout correspondiente según el rol del usuario
  if (storedRole.includes(Roles.STUDENT)) {
    return <StudentLayout />;
  }
  
  if (storedRole.includes(Roles.TEACHER)) {
    return <TeacherLayout />;
  }

  if (storedRole.includes(Roles.ADMIN)) {
    // Verificar si estamos en una ruta de administración
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    
    // Si estamos en una ruta de administración, mostrar el Admin
    if (isAdminRoute) {
      return <Admin />;
    } else {
      // Si el admin está en una ruta no administrativa, mostrar el layout por defecto
      return <StudentLayout />;
    }
  }

  // Si no hay un rol específico, mostrar el layout de estudiante por defecto
  return <StudentLayout />;
}
