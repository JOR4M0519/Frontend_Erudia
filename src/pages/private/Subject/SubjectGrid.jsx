import { Card } from "../../../components"; // Importamos el componente Card
import { studentDataService, studentService } from "../Dashboard/StudentLayout/StudentService";
// import { teacherService } from "../Dashboard/TeacherLayout/TeacherService";
import { hasAccess } from "../../../utilities/accesControl.utility";
import { Roles } from "../../../models";
import { useSelector } from "react-redux";
import { decodeRoles } from "../../../utilities";

export default function SubjectGrid() {
  const userState = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];

  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);

  // Seleccionar el servicio correcto según el rol
  const serviceData = studentDataService;
  const serviceView = studentService;

  const subjectsValue = serviceData.getSubjectsValue();

  if (!subjectsValue || !subjectsValue.subjects) {
    return <p className="text-gray-500">Cargando materias...</p>;
  }

  const handleSubjectClick = (subject) => {
    const subjectString = JSON.stringify(subject); // Convertir objeto a string
    studentService.setSelectedSubject(subjectString); // Almacenar en sessionStorage y en el observable
    studentService.setView("subjectTasks"); // Cambiar la vista
  };
  

  return (
    <div>
      {/* 🔹 Título "Mis Materias (X)" */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Mis Materias ({subjectsValue.subjects.length})
      </h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
      
      {subjectsValue.subjects.map((subject) => (
        <Card
        key={subject.id}
        className="relative w-full h-40 cursor-pointer hover:shadow-md transition-shadow rounded-lg overflow-hidden"
        onClick={() => handleSubjectClick(subject)}
      >
        {/* 🔹 Imagen de fondo */}
        <div 
          className="absolute top-0 left-0 w-full h-3/4 bg-cover bg-center" 
          style={{ backgroundImage: `url('/bg-subject.png')` }}
        />
      
        {/* 🔹 Contenedor de Información con Fondo Sólido */}
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gray-300 flex flex-col justify-center p-6 rounded-b-lg">
          <h3 className="text-md font-medium text-gray-800">{subject.subjectName}</h3>
          <p className="text-sm  text-gray-600">
            {isTeacher ? `${subject.grade}` : `Prof. ${subject.teacherName || "No asignado"}`}
          </p>
        </div>
      </Card>
      
      
      ))}
    </div>
    </div>
  );
}
