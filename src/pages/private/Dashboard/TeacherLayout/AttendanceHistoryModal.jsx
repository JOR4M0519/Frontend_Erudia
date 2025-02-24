import { X } from "lucide-react"

export default function AttendanceHistoryModal({ isOpen, onClose, students }) {
  if (!isOpen) return null

  const days = Array.from({ length: 19 }, (_, i) => i + 1)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl shadow-lg">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Historial de Asistencia</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-cols-[300px_repeat(19,40px)] gap-2 mb-4">
              <div className="font-medium">Lista de estudiantes</div>
              {days.map((day) => (
                <div key={day} className="text-center font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="grid grid-cols-[300px_repeat(19,40px)] gap-2 items-center">
                  <div className="truncate">
                    {student.firstName} {student.lastName}
                  </div>
                  {days.map((day) => (
                    <div key={day} className="flex justify-center">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

