import React, { useEffect } from "react";
import { Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { RoutesWithNotFound } from "../../../utilities";
import { AdminAcademy,
   AdminEmployees,
   AdminInstitution, 
   AdminStudents, 
   AdminSystem,
   } from "./";

import { AdminRoutes } from "../../../models/routes";


import { AdminInstitutionConfig, FamilyReport } from "./Institution";
import { AdminStudentProcesses, AdminStudentReport } from "./Students";
import { EmployeeConsolidated } from "./Employees";
import { AcademicConfiguration, AcademicProcesses, AcademicReports } from "./Academy";
import { SystemUsers } from "./System";


// Función helper para remover el prefijo '/admin' de las rutas
const removeAdminPrefix = (path) => path.replace('/admin/', '');

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir a /admin/institution si estamos en /admin/home o /admin/
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/' || location.pathname === '/admin/home') {
      navigate(AdminRoutes.INSTITUTION, { replace: true });
    }
  }, [location.pathname, navigate]);
  return (
    <RoutesWithNotFound>
      {/* Redirección por defecto a la sección de institución */}
      <Route path="/" element={<Navigate to={removeAdminPrefix(AdminRoutes.INSTITUTION)} replace />} />
      <Route path="/home" element={<Navigate to={removeAdminPrefix(AdminRoutes.INSTITUTION)} replace />} />
      
      {/* Rutas principales del panel administrativo */}
      <Route path={removeAdminPrefix(AdminRoutes.INSTITUTION)} element={<AdminInstitution />} />
      <Route path={removeAdminPrefix(AdminRoutes.STUDENTS)} element={<AdminStudents />} />
      <Route path={removeAdminPrefix(AdminRoutes.EMPLOYEES)} element={<AdminEmployees />} />
      <Route path={removeAdminPrefix(AdminRoutes.ACADEMY)} element={<AdminAcademy />} />
      <Route path={removeAdminPrefix(AdminRoutes.SYSTEM)} element={<AdminSystem />} />
      
      {/* Subpáginas de Institución */}
      <Route path={removeAdminPrefix(AdminRoutes.INSTITUTION_CONFIG)} element={<AdminInstitutionConfig section="config" />} />
      <Route path={removeAdminPrefix(AdminRoutes.INSTITUTION_REPORTS)} element={<FamilyReport section="reports" />} />
      
      {/* Subpáginas de Estudiantes */}
      <Route path={removeAdminPrefix(AdminRoutes.STUDENTS_REPORTS)} element={<AdminStudentReport section="reports" />} />
      <Route path={removeAdminPrefix(AdminRoutes.STUDENTS_PROCESSES)} element={<AdminStudentProcesses section="processes" />} />
      
      {/* Subpáginas de Empleados */}
      <Route path={removeAdminPrefix(AdminRoutes.EMPLOYEES_CONSOLIDATED)} element={<EmployeeConsolidated section="consolidated" />} />
      
      {/* Subpáginas de Academia */}
      <Route path={removeAdminPrefix(AdminRoutes.ACADEMY_REPORTS)} element={<AcademicReports section="reports" />} />
      <Route path={removeAdminPrefix(AdminRoutes.ACADEMY_CONFIG)} element={<AcademicConfiguration section="config" />} />
      <Route path={removeAdminPrefix(AdminRoutes.ACADEMY_PROCESSES)} element={<AcademicProcesses section="processes" />} />
      <Route path={removeAdminPrefix(AdminRoutes.ACADEMY_SCHEDULE)} element={<AdminAcademy section="schedule" />} />
      
      {/* Subpáginas de Sistema */}
      <Route path={removeAdminPrefix(AdminRoutes.SYSTEM_USER)} element={<SystemUsers section="user" />} />
      <Route path={removeAdminPrefix(AdminRoutes.SYSTEM_REGISTER)} element={<AdminSystem section="register" />} />
      <Route path={removeAdminPrefix(AdminRoutes.SYSTEM_MAINTENANCE)} element={<AdminSystem section="maintenance" />} />
      <Route path={removeAdminPrefix(AdminRoutes.SYSTEM_APPEARANCE)} element={<AdminSystem section="appearance" />} />
    </RoutesWithNotFound>
  );
};

export default Admin;
