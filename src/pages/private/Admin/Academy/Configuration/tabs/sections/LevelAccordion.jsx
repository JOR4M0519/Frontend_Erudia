import React, { useState } from "react";
import { 
  ChevronDown, ChevronUp,  User, 
  School,  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


// Componente Acordeón para niveles educativos
const LevelAccordion = ({ level, groups, selectedPeriod, onGroupClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div 
        className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <School className="mr-2 text-amber-500" size={20} />
          <h3 className="font-medium">{level.levelName}</h3>
          <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
            {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}
          </span>
        </div>
        <button className="text-gray-500">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groups.map((group) => (
                      <tr 
                        key={group.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => selectedPeriod ? onGroupClick(group) : null}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium">{group.groupCode}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {group.groupName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <User size={16} className="text-gray-400 mr-2" />
                            <span>{group.mentor.firstName} {group.mentor.lastName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {group.status === "A" ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Activo
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button 
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                              selectedPeriod 
                                ? 'text-amber-700 bg-amber-100 hover:bg-amber-200' 
                                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            }`}
                            disabled={!selectedPeriod}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedPeriod) onGroupClick(group);
                            }}
                          >
                            <FileText size={14} className="mr-1" />
                            Ver materias
                          </button>
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

export default LevelAccordion