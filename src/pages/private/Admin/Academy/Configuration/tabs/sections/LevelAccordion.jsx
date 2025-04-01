import React, { useState } from "react";
import { 
  ChevronDown, ChevronUp, User, 
  School, FileText, Plus, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Componente Acordeón para niveles educativos
const LevelAccordion = ({ level, groups, selectedPeriod, onGroupClick, onCreateGroup, onAssignSubject }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div className="bg-gray-50 p-4 flex justify-between items-center">
        <div 
          className="flex items-center flex-grow cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <School className="mr-2 text-amber-500" size={20} />
          <h3 className="font-medium">{level.levelName}</h3>
          <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
            {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCreateGroup(level)}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-sm px-3 py-1 rounded-md"
            title="Crear nuevo grupo"
          >
            <Plus size={16} />
            Nuevo Grupo
          </motion.button>
          <button 
            className="text-gray-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-2">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mentor
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groups.map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {group.groupCode}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {group.groupName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <User size={16} className="mr-1 text-amber-500" />
                            {group.mentor.firstName} {group.mentor.lastName}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => onAssignSubject(group)}
                              className="text-amber-600 hover:text-amber-800 flex items-center gap-1"
                              title="Asignar materia"
                            >
                              <BookOpen size={16} />
                              <span className="hidden md:inline">Asignar Materia</span>
                            </button>
                            <button
                              onClick={() => onGroupClick(group)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              title="Ver materias"
                              disabled={!selectedPeriod}
                            >
                              <FileText size={16} />
                              <span className="hidden md:inline">Ver Materias</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LevelAccordion;
