import { useState } from "react";
import { Download, Edit, Trash2 } from "lucide-react";


export default function StudentTrackingTeacher({ students }) {
  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 border-b pb-2">
        <div className="col-span-4">Estudiante</div>
        <div className="col-span-4 text-center">Fecha</div>
        <div className="col-span-2 text-center">Curso</div>
        <div className="col-span-2 text-center">Acciones</div>
      </div>

      {students.length > 0 ? (
        students.map((student) => (
          <div
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-200 transition cursor-pointer rounded-lg bg-white mt-2"
          >
            <div className="col-span-4">{student.name}</div>
            <div className="col-span-4 text-center">{student.date}</div>
            <div className="col-span-2 text-center">{student.course}</div>
            <div className="col-span-2 flex gap-2 justify-center">
              <button className="p-1 rounded-lg bg-gray-300 hover:bg-gray-400 transition">
                <Download className="w-4 h-4 text-gray-800" />
              </button>
              <button className="p-1 rounded-lg bg-blue-300 hover:bg-blue-400 transition">
                <Edit className="w-4 h-4 text-blue-800" />
              </button>
              <button className="p-1 rounded-lg bg-red-300 hover:bg-red-400 transition">
                <Trash2 className="w-4 h-4 text-red-800" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center p-4">No hay estudiantes disponibles.</p>
      )}

      {/* {selectedStudent && (
        <StudentModal
          isOpen={!!selectedStudent}
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )} */}
    </div>
  );
}
