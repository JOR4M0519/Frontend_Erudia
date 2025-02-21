import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 🔹 Importamos useNavigate
import { Card } from "../../../components"; 
import { studentDataService, teacherDataService } from "../Dashboard/StudentLayout/StudentService";
import { hasAccess } from "../../../utilities/accesControl.utility";
import { Roles } from "../../../models";
import { useSelector } from "react-redux";
import { decodeRoles } from "../../../utilities";
import {subjectTaskService} from "./";

export default function SubjectGrid() {
  const navigate = useNavigate(); // 🔹 Hook para redirigir
  const userState = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];
  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);
  console.log("es profesor?",isTeacher)
  const [subjects, setSubjects] = useState(null);

  useEffect(() => {
    if (isTeacher) return; // Si es profesor, no ejecutar este useEffect
    
    const subscription = studentDataService.getStudentData().subscribe(data => {
      setSubjects(data?.subjects || []);
    });

    return () => subscription.unsubscribe();
  }, [userState, isTeacher]); // Dependencia en isTeacher

  // ✅ Para PROFESORES
  useEffect(() => {
    if (!isTeacher) return; // Si NO es profesor, no ejecutar este useEffect

    const fetchSubjectsForTeacher = async () => {
      try {
        const response = await teacherDataService.fetchSubjectsData(userState.id);
        setSubjects(response || []);
      } catch (error) {
        console.error("Error al obtener materias para el profesor:", error);
      }
    };

    fetchSubjectsForTeacher();
  }, [userState, isTeacher]); // Dependencia en isTeacher

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
        Mis Materias ({subjects.length})
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card
            key={subject.id}
            className="relative w-full h-40 cursor-pointer hover:shadow-md transition-shadow rounded-lg overflow-hidden"
            onClick={() => {isTeacher ? handleSubjectTeacherClick(subject) : handleSubjecStudentClick(subject)}}
          >
            <div 
              className="absolute top-0 left-0 w-full h-3/4 bg-cover bg-center" 
              style={{ backgroundImage: `url('/bg-subject.png')` }}
            />
            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gray-300 flex flex-col justify-center p-6 rounded-b-lg">
              <h3 className="text-md font-medium text-gray-800">{subject.subjectName}</h3>
              <p className="text-sm text-gray-600">
                {isTeacher ? `CLase: ${subject.grade}` : `Prof. ${subject.teacherName || "No asignado"}`}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
