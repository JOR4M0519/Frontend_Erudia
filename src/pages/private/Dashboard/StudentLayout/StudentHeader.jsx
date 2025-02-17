import { PeriodSelector } from "../../../../components"
import { studentDataService } from "./index"
import { useSelector } from "react-redux"
import { Bell, Search } from "lucide-react"

export default function StudentHeader({ selectedPeriod, setSelectedPeriod, periods }) {
  const studentData = studentDataService.getSubjectsValue()
  const userState = useSelector((store) => store.user)

  if (!studentData) return null

  return (
    <div className="h-16 bg-[#e5e5e5] shadow-sm flex items-center px-6">
      <div className="flex-1 flex items-center justify-between gap-4">
        {/* Logo y nombre del estudiante */}
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
          <div>
            <h1 className="text-lg font-semibold text-gray-800">{userState.name || "Estudiante"}</h1>
            <p className="text-sm text-gray-600">{studentData.group?.groupName || "Grupo"}</p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="max-w-md w-full relative">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full px-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>

        {/* Información del periodo y notificaciones */}
        <div className="flex items-center gap-6">
          <PeriodSelector selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} periods={periods} />

          {/* Notificaciones */}
          <button className="relative p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Bell className="h-6 w-6 text-gray-700" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              2
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

