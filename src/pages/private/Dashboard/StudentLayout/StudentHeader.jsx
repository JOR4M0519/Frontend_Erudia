
import { Card, Notifications, PeriodSelector } from "../../../../components"; 
import { studentDataService } from "./index"; // Importamos RxJS
import { useSelector } from "react-redux";

export default function StudentHeader({ selectedPeriod, setSelectedPeriod, periods }) {
  // Obtener los datos del estudiante directamente desde RxJS (sin estado)
  const studentData = studentDataService.getSubjectsValue(); // Obtiene el último valor almacenado
  const userState = useSelector(store => store.user);

  if (!studentData) return null; // Evita errores si aún no hay datos

  return (
    <Card className="bg-gray-100">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{userState.name || "Desconocido"}</h1>
          <p className="text-gray-600">{studentData.group?.groupName || "Desconocido"}</p>
        </div>

        <div className="flex items-center space-x-8">
          <PeriodSelector selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          periods={periods}/>
          <div className="text-right">
            <p className="font-medium">Director de grado: {studentData.group?.mentor?.firstName || "Desconocido"} {studentData.group?.mentor?.lastName || ""}</p>
            <p className="text-gray-600">{studentData.subjects?.length || 0} materias</p>
          </div>
          <Notifications />
        </div>
      </div>
    </Card>
  );
}
