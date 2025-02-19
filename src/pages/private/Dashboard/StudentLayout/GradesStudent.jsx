import { useEffect, useState } from "react";
import { FileDown } from "lucide-react";
import { BackButton, Card } from "../../../../components";
import { studentDataService } from "./index";
import { useSelector } from "react-redux";
import { configViewService } from "../../Setting";
import { useNavigate } from "react-router-dom";

export default function GradesStudent() {
  const [grades, setGrades] = useState([]);
  const userState = useSelector((store) => store.selectedUser);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);

  // 🔹 Obtener el período seleccionado
  useEffect(() => {
    const selectedPeriodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
    return () => selectedPeriodSubscription.unsubscribe();
  }, []);

  // 🔹 Actualizar materias cuando cambia el usuario
  useEffect(() => {
    const subscription = studentDataService.getStudentData().subscribe(data => {
      setSubjects(data?.subjects || []);
    });

    return () => subscription.unsubscribe();
  }, [userState]);

  // 🔹 Obtener calificaciones solo cuando las materias han sido actualizadas
  useEffect(() => {
    if (!selectedPeriod || !userState.id || subjects.length === 0) return;

    const fetchGrades = async () => {
      console.log("Obteniendo calificaciones para:", userState.id, "Materias:", subjects);
      const gradesData = await studentDataService.getGrades(selectedPeriod, userState.id, subjects);
      setGrades(gradesData);
    };

    fetchGrades();
  }, [selectedPeriod, userState, subjects]);

  const handleDownloadBulletin = () => {
    console.log("Descargando boletín...");
  };

  const formatGrade = (grade) => (grade ? grade.toFixed(1) : "N/A");

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Calificaciones Totales</h2>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            onClick={handleDownloadBulletin}
          >
            <FileDown className="h-4 w-4" />
            Boletín
          </button>
          <BackButton onClick={() => navigate("/dashboard")} />
        </div>

        <div className="space-y-2">
          {grades.length > 0 ? (
            grades.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">{item.subjectName}</span>
                <span className="font-semibold text-primary">{formatGrade(item.grade)}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No hay calificaciones disponibles.</p>
          )}
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Promedio</span>
            <span className="font-semibold text-primary">
              {grades.length > 0
                ? formatGrade(grades.reduce((acc, curr) => acc + curr.grade, 0) / grades.length)
                : "--"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
