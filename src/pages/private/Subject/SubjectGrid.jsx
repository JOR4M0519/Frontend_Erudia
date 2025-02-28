import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card } from "../../../components"; 
import { studentDataService, teacherDataService } from "../Dashboard/StudentLayout/StudentService";
import { hasAccess } from "../../../utilities/accesControl.utility";
import { PrivateRoutes, Roles } from "../../../models";
import { useSelector } from "react-redux";
import { decodeRoles } from "../../../utilities";
import { subjectActivityService, SubjectCard } from "./";

export default function SubjectGrid() {
  const navigate = useNavigate();
  const userState = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];
  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);
  const reduxSelectedDate = useSelector((state) => state.date.selectedDate);
  const [subjects, setSubjects] = useState(null);
  const [directionSubjects, setDirectionSubjects] = useState([]);

  // Efecto para cargar materias
  useEffect(() => {
    if (!userState?.id) return;
    
    const subscription = isTeacher
      ? teacherDataService.getSubjects().subscribe(data => {
          setSubjects(data);
        })
      : studentDataService.getStudentData().subscribe(data => {
          setSubjects(data?.subjects || []);
        });
    
    return () => subscription.unsubscribe();
  }, [userState?.id, isTeacher]);

  // Efecto separado para cargar dirección de grupo (solo para profesores)
  useEffect(() => {
    if (!userState?.id || !isTeacher) return;

    // Cargar datos iniciales
    const year = new Date(reduxSelectedDate).getFullYear();
    teacherDataService.fetchDirectionSubjectsData(userState.id, year);
    
    // Suscripción al observable
    const subscription = teacherDataService.getStudentGroupListData().subscribe(data => {
      if (data?.directionGroupList) {
        setDirectionSubjects(data.directionGroupList);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [userState?.id, isTeacher, reduxSelectedDate]);
  
  if (!subjects) return <p className="text-gray-500">Cargando materias...</p>;

  const handleSubjecStudentClick = (subject) => {
    const subjectString = JSON.stringify(subject);
    subjectActivityService.setSelectedSubject(subjectString);
    navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT);
  };

  const handleSubjectTeacherClick = (subjectGroup) => {
    const subjectString = JSON.stringify(subjectGroup);
    subjectActivityService.setSelectedSubject(subjectString);
    navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT);
  };

  return (
    <div>
      {/* Sección de Materias */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Mis Materias ({isTeacher ? subjects?.subjects?.length || 0 : subjects?.length || 0})
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {isTeacher
          ? (Array.isArray(subjects?.subjects) && subjects.subjects.length > 0
            ? subjects.subjects.map((subject, index) => (
                <SubjectCard 
                  key={`subject-${subject.id || ''}-${index}`}
                  subject={subject}
                  isTeacher={true}
                  onClick={handleSubjectTeacherClick}
                />
              ))
            : <p className="text-gray-500">No hay materias disponibles.</p>)
          
          : (Array.isArray(subjects) && subjects.length > 0
              ? subjects.map((subject, index) => (
                  <SubjectCard 
                    key={`subject-${subject.id || ''}-${index}`}
                    subject={subject}
                    isTeacher={false}
                    onClick={handleSubjecStudentClick}
                  />
                ))
              : <p className="text-gray-500">No hay materias disponibles.</p>)
        }
      </div>
      
      {/* Sección de Dirección de Grupo (solo para profesores) */}
      {isTeacher && (
        <section className="py-2 mt-6">
          <SubjectDirector directionSubjects={directionSubjects} />
        </section>
      )}
    </div>
  );
}

const SubjectDirector = ({ directionSubjects = [] }) => {
  const navigate = useNavigate();
  
  const handleDirectionSubjecClick = (group) => {
    if (!group) return;
    
    const subjectString = JSON.stringify(group);
    subjectActivityService.setSelectedSubject(subjectString);
    navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT);
  };

  return (
    <>
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Dirección de grupo
      </h2>
      {Array.isArray(directionSubjects) && directionSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {directionSubjects.map((group, index) => (
            <SubjectCard 
              key={`direction-${group.id || index}`}
              group={group}
              isTeacher={true}
              onClick={() => handleDirectionSubjecClick(group)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay cursos de dirección disponibles.</p>
      )}
    </>
  );
};