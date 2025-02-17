import { Card } from "../components/index";
import { studentService } from "../pages/private/Dashboard/StudentLayout";
//import {studentService} from "../windows/StudentLayout/StudentService";

export default function GradesCard() {
  return (
    <Card title="Calificaciones totales" className="mb-6">
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => studentService.setView("grades")} // Cambio de vista con RxJS
      >
        Ver calificaciones
      </button>
    </Card>
  );
}
