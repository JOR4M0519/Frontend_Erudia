import { CalendarDays, ChevronDown } from "lucide-react"

export default function PeriodSelector({ selectedPeriod, setSelectedPeriod, periods }) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md border border-gray-200 transition-all hover:shadow-lg">
      <div className="flex items-center gap-3 text-gray-700">
        <div className="bg-blue-100 p-2 rounded-full">
          <CalendarDays className="w-5 h-5 text-blue-600" />
        </div>
        <span className="text-lg font-semibold">{new Date().getFullYear()}</span>
      </div>

      <div className="relative flex-grow">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 px-4 py-3 pr-8 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all cursor-pointer hover:bg-gray-100"
        >
          {periods.length > 0 ? (
            periods.map((period) => (
              <option key={period.id} value={period.id} className="py-2">
                {period.name} • {formatDate(period.startDate)} → {formatDate(period.endDate)}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No hay periodos disponibles
            </option>
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
      </div>
    </div>
  )
}

function formatDate(dateString) {
  const options = { day: "2-digit", month: "short" }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}

