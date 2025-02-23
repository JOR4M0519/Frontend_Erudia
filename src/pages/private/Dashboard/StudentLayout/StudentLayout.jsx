import { Routes, Route, Navigate } from "react-router-dom";
import { HomeStudent, studentDataService, teacherDataService } from "./index";
import { SubjectTasks } from "../../Activities";
import { ActivityModal } from "../../Activities";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { Roles } from "../../../../models";
import { decodeRoles, hasAccess } from "../../../../utilities";

export default function StudentLayout() {
  const userState = useSelector(store => store.selectedUser); // Obtener el usuario del store
  const storedRole = decodeRoles(userState.roles) || [];
  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);

  useEffect(() => {
    if (!userState?.id) return; // No ejecuta si no hay usuario

    if (isTeacher) {
      teacherDataService.fetchGroupsData(userState.id, new Date().getFullYear()); // Obtiene datos del profesor
    } else {
      studentDataService.fetchStudentData(userState.id);
    }
  }, [userState?.id, isTeacher]);


  return (
    <div className="space-y-6 p-6">
      <Routes>
        <Route path="/" element={<Navigate to="home" />} /> {/* Redirige a `home` por defecto */}
        <Route path="home" element={<HomeStudent />} />
        <Route path="subjectTasks" element={<SubjectTasks />} />
      </Routes>
      <ActivityModal /> 
    </div>
  );
}
