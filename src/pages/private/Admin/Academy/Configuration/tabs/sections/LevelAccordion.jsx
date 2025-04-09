import React, { useState } from "react";
import { 
  ChevronDown, ChevronUp, User, 
  School, FileText, Plus, BookOpen, Trash2,
  Hash, Type, Edit // Nuevos iconos
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LevelAccordion = ({ 
  level, 
  groups, 
  onCreateGroup,
  onEditGroup, // Nueva prop para edición
  onAssignSubject, 
  onViewSubjects,
  onDeleteGroup,
  periodSelected
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Cabecera del acordeón */}
      <div
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={toggleAccordion}
      >
        <div className="flex items-center">
          <School className="text-blue-600 mr-2" size={20} />
          <div>
            <h3 className="font-medium">{level.levelName}</h3>
            <p className="text-sm text-gray-500">
              {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateGroup();
            }}
            className="mr-4 text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Crear Grupo
          </button>
          {isOpen ? (
            <ChevronUp className="text-gray-400" size={20} />
          ) : (
            <ChevronDown className="text-gray-400" size={20} />
          )}
        </div>
      </div>

      {/* Contenido del acordeón */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Código
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Nombre
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Director de Grupo
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groups.map((group) => (
                      <tr key={group.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Hash size={16} className="text-gray-400 mr-2" />
                            {group.groupCode}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <Type size={16} className="text-blue-500 mr-2" />
                            {group.groupName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User size={16} className="text-amber-500 mr-2" />
                            <div className="text-sm text-gray-900">
                              {group.mentor ? (
                                `${group.mentor.firstName} ${group.mentor.lastName}`
                              ) : (
                                <span className="text-gray-500 italic">
                                  Sin asignar
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => onEditGroup(group)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar grupo"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => onAssignSubject(group)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Asignar materia"
                            >
                              <FileText size={18} />
                            </button>
                            <button
                              onClick={() => onViewSubjects(group)}
                              className={`${
                                periodSelected 
                                  ? "text-blue-600 hover:text-blue-900" 
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                              disabled={!periodSelected}
                              title={
                                periodSelected 
                                  ? "Ver materias" 
                                  : "Seleccionar periodo académico"
                              }
                            >
                              <BookOpen size={18} />
                            </button>
                            <button
                              onClick={() => onDeleteGroup(group.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar grupo"
                            >
                              <Trash2 size={18} />
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