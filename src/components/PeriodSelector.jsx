import { CalendarDays, ChevronDown } from "lucide-react"

export default function PeriodSelector({ selectedPeriod, setSelectedPeriod, periods }) {
  return (
    <>

      {/*  Selector de periodos */}
      <div className="relative flex-grow">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="appearance-none w-full bg-gray-50 border border-gray-300 
          text-gray-700 px-4 py-1 pr-10 rounded-lg focus:ring-2 
          focus:ring-blue-400 focus:border-blue-500 transition 
          cursor-pointer hover:bg-gray-100"
        >
          {periods.length > 0 ? (
            periods.map((period) => (
              <option key={period.id} value={period.id} className="py-2">
                {`${period.name} `}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No hay periodos disponibles
            </option>
          )}
        </select>

        {/*  Icono de dropdown */}
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
      </div>
    </>
  )
}