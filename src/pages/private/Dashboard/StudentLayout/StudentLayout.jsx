import { Routes, Route, Navigate } from "react-router-dom";
import { HomeStudent, studentDataService, studentService } from "./index";
import { SubjectTasks } from "../../Activities";
import { ActivityModal } from "../../Activities";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export default function StudentLayout() {
  const userState = useSelector(store => store.selectedUser); // Obtener el usuario del store

  useEffect(() => {
    if (userState?.id) {
      studentDataService.fetchStudentData(userState.id);
    }
  }, [userState]);


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
