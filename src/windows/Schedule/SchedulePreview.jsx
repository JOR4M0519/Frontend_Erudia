import React, { useState } from "react";
import { Card } from "../../components/index";

export default function SchedulePreview() {
  const [isOpen, setIsOpen] = useState(false);
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  return (
    <div>
      {/* Trigger para abrir el modal */}
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gray-100 p-4">
          <h3 className="font-medium mb-2">Horario-cronograma</h3>
          <div className="text-sm space-y-1">
            {days.map((day) => (
              <div key={day} className="text-gray-600">
                {day}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">Click para ver horario completo</p>
        </Card>
      </div>

      {/* Modal personalizado sin librerías */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl shadow-lg w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Horario Completo</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-black">
                ✖
              </button>
            </div>
            <div className="grid grid-cols-5 gap-4 mt-4">
              {days.map((day) => (
                <div key={day} className="space-y-2">
                  <h4 className="font-medium">{day}</h4>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((hour) => (
                      <Card key={hour} className="p-2 bg-gray-50">
                        <p className="text-sm font-medium">{`${7 + hour}:00 - ${8 + hour}:00`}</p>
                        <p className="text-sm text-gray-600">Materia {hour}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
