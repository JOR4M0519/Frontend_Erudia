import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { teacherDataService } from "../Dashboard/StudentLayout/StudentService";
import { BackButton } from "../../../components";
import { PrivateRoutes } from "../../../models";

export default function ActivitiesGrading() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [subject, setSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    if (!location.state?.activity || !location.state?.subject) {
      console.error("🚨 Error: No hay datos de actividad o materia.");
      navigate(PrivateRoutes.DASHBOARD); // 🔹 Redirigir si no hay datos
      return;
    }

    setActivity(location.state.activity);
    setSubject(location.state.subject);

    // 🔹 Obtener lista de estudiantes y sus notas
    const fetchStudents = async () => {
      try {
        const studentList = await teacherDataService. getActivitiesScoresForGroup(
          location.state.activity.id,
          location.state.subject.group.id
        );
        setStudents(studentList || []);
      } catch (error) {
        console.error("Error cargando estudiantes:", error);
      }
    };

    fetchStudents();
  }, [location.state, navigate]);

  if (!activity || !subject) {
    return <p className="text-gray-500 text-center">Cargando información...</p>;
  }

  return (
    <div className="space-y-6">
      {/* 🔹 Encabezado */}
      <div className="flex items-center justify-between bg-gray-200 rounded-lg p-4">
        <h2 className="text-xl font-bold">{activity.name}</h2>
        <span className="text-sm text-gray-600">Grupo: {subject.group?.groupName || "N/A"}</span>
      </div>

      {/* 🔹 Lista de Estudiantes */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-2">Lista de estudiantes</h3>
        <div className="divide-y divide-gray-200">
          {students.length > 0 ? (
            students.map((student) => (
              <div key={student.studentId} className="flex justify-between items-center p-2">
                <span>{student.firstName} {student.lastName}</span>
                <input
                  type="number"
                  className="border p-1 rounded w-20"
                  value={grades[student.studentId] || ""}
                  onChange={(e) =>
                    setGrades({ ...grades, [student.studentId]: e.target.value })
                  }
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center p-4">No hay estudiantes en este grupo.</p>
          )}
        </div>
      </div>

      {/* 🔹 Botón de Guardar */}
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Guardar Calificaciones
        </button>
      </div>

      {/* 🔹 Botón de Regreso */}
      <BackButton confirmExit={true} onClick={() => navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT)} />
    </div>
  );
}
