import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 🔹 Importamos useNavigate
import { Card } from "../../../components"; 
import { studentDataService, teacherDataService } from "../Dashboard/StudentLayout/StudentService";
import { hasAccess } from "../../../utilities/accesControl.utility";
import { Roles } from "../../../models";
import { useSelector } from "react-redux";
import { decodeRoles } from "../../../utilities";
import {subjectTaskService} from "./";
import SubjectCard from "./SubjectCard";

export default function SubjectGrid() {
  const navigate = useNavigate(); // 🔹 Hook para redirigir
  const userState = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];
  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);
  const [subjects, setSubjects] = useState(null);
  
  useEffect(() => {
    if (!userState?.id) return; // Si no hay usuario, no ejecuta nada

    const subscription = isTeacher
      ? teacherDataService.getSubjects().subscribe(setSubjects)
      : studentDataService.getStudentData().subscribe(data => {
          setSubjects(data?.subjects || []);
        });

    return () => subscription.unsubscribe();
  }, [userState?.id, isTeacher]);

  if (!subjects) return <p className="text-gray-500">Cargando materias...</p>;

  const handleSubjecStudentClick = (subject) => {
    const subjectString = JSON.stringify(subject);
    subjectTaskService.setSelectedSubject(subjectString); // Almacenar en sessionStorage y en el observable
    
    // 🔹 Redirigir a `subjectTasks`
    navigate("/dashboard/subjectTasks");
  };

  //Falta por realizar
  const handleSubjectTeacherClick = (subjectGroup) => {
    const subjectString = JSON.stringify(subjectGroup);
    subjectTaskService.setSelectedSubject(subjectString); // Almacenar en sessionStorage y en el observable
    
    // 🔹 Redirigir a `subjectTasks`
    navigate("/dashboard/subjectTasks");
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Mis Materias ({isTeacher ? subjects?.subjects?.length || 0 : subjects?.length || 0})
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
      {isTeacher
        ? (Array.isArray(subjects?.subjects) && subjects.subjects.length > 0
          ? subjects.subjects.map((subject, index) => ( // 🔹 Aquí se declara `index`
              <SubjectCard 
                key={`${subject.id}-${index}`} // ✅ ID + índice para garantizar unicidad
                subject={subject}
                isTeacher={true}
                onClick={handleSubjectTeacherClick}
              />
            ))
          : <p className="text-gray-500">No hay materias disponibles.</p>)
        
        : (Array.isArray(subjects) && subjects.length > 0
            ? subjects.map((subject) => (
                <SubjectCard 
                  key={subject.id}
                  subject={subject}
                  isTeacher={false}
                  onClick={handleSubjecStudentClick}
                />
              ))
            : <p className="text-gray-500">No hay materias disponibles.</p>)
        }
      </div>
    </div>
  );
  
}
