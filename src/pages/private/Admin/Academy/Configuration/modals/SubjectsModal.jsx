import React from "react";
import { 
 Book, User, School, BookOpen,  X,
} from "lucide-react";
import { motion} from "framer-motion";


const SubjectsModal = ({ isOpen, onClose, group, subjects }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Materias del grupo: {group.groupName}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <School size={18} className="text-amber-500 mr-2" />
                <span className="text-sm text-gray-500">Nivel:</span>
              </div>
              <p className="font-medium">{group.level.levelName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <User size={18} className="text-amber-500 mr-2" />
                <span className="text-sm text-gray-500">Mentor:</span>
              </div>
              <p className="font-medium">{group.mentor.firstName} {group.mentor.lastName}</p>
              <p className="text-sm text-gray-500">{group.mentor.email}</p>
            </div>
          </div>

          <h3 className="font-medium text-lg mb-4 flex items-center">
            <BookOpen size={18} className="text-amber-500 mr-2" />
            Materias asociadas ({subjects.length})
          </h3>

          {subjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay materias asociadas a este grupo en el período seleccionado.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Materia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profesor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Book size={16} className="text-amber-500 mr-2" />
                          <span>{item.subjectProfessor.subject.subjectName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <span>
                            {item.subjectProfessor.professor.firstName} {item.subjectProfessor.professor.lastName}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SubjectsModal