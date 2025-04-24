import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card } from "../../../components"; 
import { studentDataService, teacherDataService } from "../Dashboard/StudentLayout/StudentService";
import { hasAccess } from "../../../utilities/accesControl.utility";
import { PrivateRoutes, Roles } from "../../../models";
import { useSelector } from "react-redux";
import { decodeRoles } from "../../../utilities";
import { subjectActivityService, GroupCard, SubjectCard,DirectionGroupCard } from "./";
import { Users, BookOpen, Briefcase } from "lucide-react";

export default function SubjectGrid() {
  const navigate = useNavigate();
  const userState = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];
  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);
  const reduxSelectedDate = useSelector((state) => state.date.selectedDate);
  
  const [subjects, setSubjects] = useState(null);
  const [directionSubjects, setDirectionSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedSubjects, setGroupedSubjects] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [view, setView] = useState('groups'); // 'groups' o 'subjects'

  // Efecto para cargar materias
  useEffect(() => {
    if (!userState?.id) return;
    
    setLoading(true);
    const subscription = isTeacher
      ? teacherDataService.getSubjects().subscribe(data => {
          setSubjects(data);
          if (data?.subjects && Array.isArray(data.subjects)) {
            processSubjects(data.subjects);
          }
          setLoading(false);
        })
      : studentDataService.getStudentData().subscribe(data => {
          const subjectData = data?.subjects || []; 
          setSubjects(subjectData);
          processSubjects(subjectData);
          setLoading(false);
        });
    
    return () => subscription.unsubscribe();
  }, [userState?.id, isTeacher]);

  // Efecto para cargar dirección de grupo (solo para profesores)
  useEffect(() => {
    if (!userState?.id || !isTeacher) return;

    const year = new Date(reduxSelectedDate).getFullYear();
    teacherDataService.fetchDirectionSubjectsData(userState.id, year);
    
    const subscription = teacherDataService.getStudentGroupListData().subscribe(data => {
      if (data?.directionGroupList) {
        setDirectionSubjects(data.directionGroupList);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [userState?.id, isTeacher, reduxSelectedDate]);

  // Procesar y agrupar materias por grupo
  const processSubjects = (subjectsData) => {
    // Verificar que subjectsData sea un array
    if (!Array.isArray(subjectsData) || subjectsData.length === 0) {
      setGroupedSubjects({});
      return;
    }
    
    const grouped = {};
    console.log(subjectsData)
    subjectsData.forEach(subject => {
      if (!subject) return;
      console.log(subject);
      
      // Adaptación para profesores y estudiantes
      const group = isTeacher ? subject.group : subject.group;
      if (!group) return;
      
      const groupId = group.id;
      if (!groupId) return;
      
      if (!grouped[groupId]) {
        grouped[groupId] = {
          group: group,
          subjects: []
        };
      }
      
      // Evitar duplicados
      const subjectId = subject.id;
      const subjectName = subject.subjectName;
      
      if (!grouped[groupId].subjects.some(s => s.id === subjectId && s.subjectName === subjectName)) {
        grouped[groupId].subjects.push(subject);
      }
    });
    
    setGroupedSubjects(grouped);
    
    // Inicializar el primer grupo como expandido si hay grupos
    const groupIds = Object.keys(grouped);
    if (groupIds.length > 0) {
      setExpandedGroups({ [groupIds[0]]: true });
    }
  };

  // Manejar clic en una materia (para estudiantes)
  const handleSubjecStudentClick = (subject) => {
    if (!subject) {
      console.error("Subject is undefined or null");
      return;
    }
    
    const subjectString = JSON.stringify(subject);
    subjectActivityService.setSelectedSubject(subjectString);
    navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT);
  };

  // Manejar clic en una materia (para profesores)
  const handleSubjectTeacherClick = (subjectGroup) => {
    if (!subjectGroup) {
      console.error("Subject Group is undefined or null");
      return;
    }
    
    const subjectString = JSON.stringify(subjectGroup);
    subjectActivityService.setSelectedSubject(subjectString);
    navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT);
  };

  // Manejar clic en dirección de grupo
  const handleDirectionSubjecClick = (group) => {
    if (!group) return;
    
    const subjectString = JSON.stringify(group);
    subjectActivityService.setSelectedSubject(subjectString);
    navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.DIRECTOR_GROUP_SUBJECTS);
  };

  // Alternar la expansión de un grupo
  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no hay materias, mostrar mensaje
  const hasNoSubjects = (!subjects) || 
                        (isTeacher && (!subjects?.subjects || subjects.subjects.length === 0)) || 
                        (!isTeacher && (!Array.isArray(subjects) || subjects.length === 0));
                        
  if (hasNoSubjects) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BookOpen size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">No tienes materias asignadas</p>
        <p className="text-gray-400 text-sm mt-2">Las materias aparecerán aquí cuando se te asignen</p>
      </div>
    );
  }

  // Para depuración
  console.log("Subjects data:", subjects);
  console.log("Direction subjects:", directionSubjects);
  console.log("Grouped subjects:", groupedSubjects);

  return (
    <div className="container mx-auto">
      {/* Cabecera con título y botones de vista */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Mis Materias ({isTeacher ? subjects?.subjects?.length || 0 : subjects?.length || 0})
        </h2>
        
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1.5 rounded-lg flex items-center text-sm font-medium transition-colors
                      ${view === 'groups' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setView('groups')}
          >
            <Users size={16} className="mr-1.5" />
            Por Grupos
          </button>
          <button 
            className={`px-3 py-1.5 rounded-lg flex items-center text-sm font-medium transition-colors
                      ${view === 'subjects' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setView('subjects')}
          >
            <BookOpen size={16} className="mr-1.5" />
            Todas las Materias
          </button>
        </div>
      </div>
      
      {/* Vista de grupos con acordeón */}
      {view === 'groups' && (
        <div className="space-y-4 animate-fadeIn">
          {Object.entries(groupedSubjects).map(([groupId, { group, subjects }]) => (
            <GroupCard
              key={groupId}
              group={group}
              subjects={subjects || []}
              isTeacher={isTeacher}
              onSubjectClick={isTeacher ? handleSubjectTeacherClick : handleSubjecStudentClick}
              isExpanded={expandedGroups[groupId]}
              onToggle={() => toggleGroupExpansion(groupId)}
            />
          ))}
        </div>
      )}
      
      {/* Vista de todas las materias */}
      {view === 'subjects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {isTeacher
            ? (Array.isArray(subjects?.subjects) && subjects.subjects.length > 0
                ? subjects.subjects.map((subject, index) => (
                    <SubjectCard 
                      key={`subject-${subject?.id || ''}-${index}`}
                      subject={subject}
                      isTeacher={true}
                      onClick={handleSubjectTeacherClick}
                    />
                  ))
                : <p className="text-gray-500">No hay materias disponibles.</p>)
            
            : (Array.isArray(subjects) && subjects.length > 0
                ? subjects.map((subject, index) => (
                    <SubjectCard 
                      key={`subject-${subject?.id || ''}-${index}`}
                      subject={subject}
                      isTeacher={false}
                      onClick={handleSubjecStudentClick}
                    />
                  ))
                : <p className="text-gray-500">No hay materias disponibles.</p>)
          }
        </div>
      )}
      
      {/* Mostrar dirección de grupo para profesores con el nuevo componente */}
      {isTeacher && Array.isArray(directionSubjects) && directionSubjects.length > 0 && (
        <section className="py-2 mt-8 border-t border-gray-100 pt-6">
          <div className="flex items-center mb-4">
            <Briefcase size={20} className="text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">
              Dirección de grupo
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {directionSubjects.map((group, index) => (
              <DirectionGroupCard 
                key={`direction-${group?.id || index}`}
                group={group}
                onClick={handleDirectionSubjecClick}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
