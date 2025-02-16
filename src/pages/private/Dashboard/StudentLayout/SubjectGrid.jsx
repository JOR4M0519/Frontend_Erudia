import { Card } from "../../../../components"; // Importamos el componente Card
import { studentDataService, studentService } from "./StudentService";

export default function SubjectGrid() {
  const studentData = studentDataService.getSubjectsValue();

  if (!studentData || !studentData.subjects) {
    return <p className="text-gray-500">Cargando materias...</p>;
  }

  const handleSubjectClick = (subjectId) => {
    console.log("Seleccionando materia:", subjectId);
    studentService.setView("subjectTasks"); // Cambiamos la vista a SubjectTasks
    sessionStorage.setItem("selectedSubject", subjectId); // Guardamos la materia en sessionStorage
  };
  console.log(studentData.subjects);

  return (
    <div className="grid grid-cols-2 gap-4">
      {studentData.subjects.map((subject) => (
        <Card
          key={subject.id}
          className="bg-blue-50 cursor-pointer hover:shadow-md transition-shadow p-4"
          onClick={() => handleSubjectClick(subject.id)}
        >
          <h3 className="text-lg font-medium">{subject.subjectName}</h3>
        </Card>
      ))}
    </div>
  );
}
