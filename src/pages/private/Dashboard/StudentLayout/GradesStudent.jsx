import { useEffect, useState } from "react";
import { FileDown, BarChart, Award, BookOpen, Star, Clock, Edit } from "lucide-react";
import { BackButton } from "../../../../components";
import { studentDataService } from "./index";
import { useSelector } from "react-redux";
import { configViewService } from "../../Setting";
import { useNavigate } from "react-router-dom";
import { PrivateRoutes } from "../../../../models";

export default function GradesStudent({ isTeacher,className}) {
  // Si se recibe student por props, lo usamos; de lo contrario, usamos el del estado global
  const userSelected =  useSelector((store) => store.selectedUser);
  
  const [grades, setGrades] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [observation, setObservation] = useState(""); // Estado para la observación
  const [isEditing, setIsEditing] = useState(false); // Controla si se está editando

  // 🔹 Obtener el período seleccionado
  useEffect(() => {
    const selectedPeriodSubscription = configViewService
      .getSelectedPeriod()
      .subscribe(setSelectedPeriod);
    return () => selectedPeriodSubscription.unsubscribe();
  }, [userSelected]);

  // 1. Invocar el fetch para cargar la data del estudiante (incluyendo subjects)
  useEffect(() => {
    if (userSelected && userSelected.id) {
      // Esto forzará la carga de los datos del estudiante (y sus materias)
      studentDataService.fetchStudentData(userSelected.id);
    }
  }, [userSelected]);

  // 🔹 Actualizar materias cuando cambia el usuario
  useEffect(() => {
    
    const subscription = studentDataService.getStudentData().subscribe((data) => {
      setSubjects(data?.subjects || []);
      
    });
    return () => subscription.unsubscribe();
  }, [userSelected]);

  // 🔹 Obtener calificaciones solo cuando se actualizan las materias
  useEffect(() => {
   
    if (!selectedPeriod || !userSelected.id || subjects.length === 0) return;
    const fetchGrades = async () => {
      const gradesData = await studentDataService.getGrades(
        selectedPeriod,
        userSelected.id,
        subjects
      );
      setGrades(gradesData);
      // Simulación: obtener la observación final del estudiante en el período
      setObservation("El estudiante ha mostrado un gran desempeño.");
    };
    fetchGrades();
  }, [selectedPeriod, userSelected, subjects]);

  const handleDownloadBulletin = () => {
    console.log("Descargando boletín...");
  };

  const handleUpdateObservation = () => {
    console.log("Actualizando observación final:", observation);
    setIsEditing(false);
  };

  const formatGrade = (grade) => (grade ? grade.toFixed(1) : "N/A");

  // Cálculos básicos
  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    return grades.reduce((acc, curr) => acc + curr.grade, 0) / grades.length;
  };

  const findBestSubject = () => {
    if (grades.length === 0) return { name: "N/A", grade: 0 };
    return grades.reduce(
      (best, current) =>
        current.grade > best.grade
          ? { name: current.subjectName, grade: current.grade }
          : best,
      { name: "", grade: 0 }
    );
  };

  const getGradeColor = (grade) => {
    if (grade >= 4.5) return "text-green-600";
    if (grade >= 4.0) return "text-blue-600";
    if (grade >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreText = (grade) => {
    if (grade >= 4.5) return "EXCELENTE";
    if (grade >= 4.0) return "MUY BUENO";
    if (grade >= 3.5) return "SATISFACTORIO";
    return "POR MEJORAR";
  };

  const average = calculateAverage();
  const bestSubject = findBestSubject();
  const scoreColor = getGradeColor(average);
  const scoreText = getScoreText(average);

  return (
    <main className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <header className="bg-white shadow-lg rounded-xl p-6 transition-all border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">
                Boletín de Calificaciones - {userSelected.name}
              </h1>
              <div className="flex items-center mt-2 bg-indigo-50 px-3 py-1 rounded-lg w-fit">
                <Clock className="w-4 h-4 text-indigo-600 mr-2" />
                <span className="text-sm text-indigo-700 font-medium">
                  {selectedPeriod
                    ? `Periodo ${selectedPeriod}`
                    : "Periodo actual"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 font-medium rounded-lg px-4 py-2 hover:bg-blue-100 transition"
                onClick={handleDownloadBulletin}
              >
                <FileDown className="w-4 h-4" />
                <span>Descargar Boletín</span>
              </button>
              {!isTeacher && <BackButton onClick={() => navigate(PrivateRoutes.DASHBOARD)}/>}
            </div>
          </div>
        </div>
      </header>

      {/* Estadísticas */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500 uppercase font-medium">
                Promedio General
              </h3>
              <p className={`text-xl font-bold ${scoreColor}`}>
                {formatGrade(average)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {grades.length} materias evaluadas
              </p>
            </div>
          </div>
        </article>
        <article className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500 uppercase font-medium">
                Mejor Desempeño
              </h3>
              <p className="text-lg font-bold text-green-600">{bestSubject.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                Calificación: {formatGrade(bestSubject.grade)}
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Sección de materias */}
      <section>
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
            Mis Materias
          </h2>
          <div className="space-y-3">
            {grades.length > 0 ? (
              grades.map((item, index) => (
                <article
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4"
                  style={{
                    borderLeftColor:
                      item.grade >= 4.5
                        ? "#16a34a"
                        : item.grade >= 4.0
                        ? "#2563eb"
                        : item.grade >= 3.5
                        ? "#ca8a04"
                        : "#dc2626",
                  }}
                >
                  <h3 className="font-medium text-gray-800">
                    {item.subjectName}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <Star className={`w-4 h-4 ${getGradeColor(item.grade)}`} />
                    </div>
                    <span
                      className={`text-lg font-semibold ${getGradeColor(
                        item.grade
                      )}`}
                    >
                      {formatGrade(item.grade)}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No hay calificaciones disponibles.
                </p>
              </div>
            )}
          </div>
          {grades.length > 0 && (
            <footer className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">
                  Promedio General
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 uppercase">
                    {scoreText}
                  </span>
                  <span className={`text-xl font-bold ${scoreColor}`}>
                    {formatGrade(average)}
                  </span>
                </div>
              </div>
            </footer>
          )}
        </div>
      </section>

      {/* Observación Final */}
      <section className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Observación Final
        </h2>
        {isTeacher ? (
          isEditing ? (
            <div className="space-y-3">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
              />
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                onClick={handleUpdateObservation}
              >
                Guardar
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700">{observation}</p>
              <button
                className="text-blue-600 flex items-center"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-1" /> Editar
              </button>
            </div>
          )
        ) : (
          <p className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            {observation}
          </p>
        )}
      </section>
    </main>
  );
}
