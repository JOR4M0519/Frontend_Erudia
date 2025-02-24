export default function SubjectHeader({ subjectName, periodGrade, onOpenScheme }) {
    return (
      <div className="flex items-center justify-between gap-10">
        <div className="flex items-center gap-10 flex-1 bg-gray-200 rounded-full p-4">
          <span className="font-medium text-gray-800 px-4">{subjectName || "Materia"}</span>
          <div className="bg-gray-300 px-4 py-1 rounded-full">
            <span className="text-sm text-gray-700">Nota del periodo: {periodGrade}</span>
          </div>
        </div>
        <button
          onClick={onOpenScheme}
          className="cursor-pointer border-2 border-blue-500 text-black font-medium rounded-full px-6 py-2 hover:bg-blue-100 transition"
        >
          Esquema de evaluación
        </button>
      </div>
    );
  }
  