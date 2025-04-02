import React, { useState } from "react";
import { Card } from "../../components/index";
import { Calendar, CircleX } from "lucide-react";

export default function SchedulePreview() {
  const [isOpen, setIsOpen] = useState(false);
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  return (
    <>

      {/* <div onClick={() => setIsOpen(true)}
        className="cursor-pointer bg-white hover:shadow-lg transition-shadow p-3 flex flex-col items-center rounded-full text-center border border-gray-300 shadow-sm"
      >
        <Calendar className="w-6 h-6 text-gray-600" />
        <span className="text-xs text-gray-700 font-medium mt-1">Mi horario</span>
      </div> */}



      {/* Modal personalizado sin librerías */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center  backdrop-blur-md  bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl shadow-lg w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Horario Completo</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-black">
                <CircleX />
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
    </>
  );
}
