import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { studentService } from "../Dashboard/StudentLayout";
//import { studentService } from "./StudentService";

export default function ActivityModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [taskData, setTaskData] = useState(null);

  useEffect(() => {
    const subscription = studentService.getTaskModal().subscribe(({ isOpen, activityData }) => {
      setIsOpen(isOpen);
      setTaskData(activityData);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md backdrop-brightness-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">{taskData?.name}</h2>
          <button
            onClick={() => studentService.closeTaskModal()}
            className="p-2 hover:bg-gray-300 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status and Grade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Estado</p>
              <p className="font-medium">{taskData?.status || "Sin estado"}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Calificación</p>
              <p className="font-medium">{taskData?.score || "-"}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium mb-3">Descripción</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="whitespace-pre-wrap text-gray-700">{taskData?.description}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-sm text-gray-600 mb-2">Fechas</h3>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-gray-600">Inicio</p>
                <p className="font-medium">{taskData?.startDate ? new Date(taskData.startDate).toLocaleDateString() : "-"}</p>
              </div>
              <div>
                <p className="text-gray-600">Entrega</p>
                <p className="font-medium">{taskData?.endDate ? new Date(taskData.endDate).toLocaleDateString() : "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
