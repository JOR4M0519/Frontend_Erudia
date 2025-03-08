import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const StatusTab = ({ year }) => {
  const [selectedClasses, setSelectedClasses] = useState({
    "Segundo B": true,
    "Segundo A": true,
  });
  
  // Datos de muestra
  const studentsData = {
    "Segundo B": [
      { id: 1, name: "Isabella Sofía Rodríguez Gómez", status: "Pendiente" },
      { id: 2, name: "María Camila Martínez López", status: "Activo" },
    ],
    "Segundo A": [
      { id: 3, name: "Isabella Sofía Rodríguez Gómez", status: "Pendiente" },
      { id: 4, name: "María Camila Martínez López", status: "Activo" },
    ],
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <input 
          type="checkbox" 
          id="selectPendingStudents" 
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          defaultChecked
        />
        <label htmlFor="selectPendingStudents" className="ml-2 block text-sm text-gray-700 font-medium">
          Seleccionar estudiantes pendientes
        </label>
      </div>

      {Object.keys(selectedClasses).map((className) => (
        <ClassSection 
          key={className}
          className={className}
          students={studentsData[className]}
          fromStatus="Pendiente"
          toStatus="Activo"
        />
      ))}

      <div className="mt-8 flex justify-center">
        <button className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors">
          Cambiar estado de todos los estudiantes
        </button>
      </div>
    </div>
  );
};

const ClassSection = ({ className, students, fromStatus, toStatus }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6 border rounded-lg overflow-hidden">
      <div 
        className="flex items-center bg-gray-50 px-4 py-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
        </motion.div>
        <h3 className="font-medium text-gray-900">{className}</h3>
      </div>

      {isExpanded && (
        <div className="px-4 py-2">
          <div className="flex justify-between border-b pb-2 mb-2">
            <div className="w-1/3 font-medium text-gray-700">Estado</div>
            <div className="w-2/3">
              <div className="flex items-center justify-end">
                <span className="mr-2">Pasar de</span>
                <div className="relative inline-block">
                  <select className="appearance-none bg-white border border-gray-300 rounded pl-3 pr-8 py-1">
                    <option>{fromStatus}</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
                <span className="mx-2">a</span>
                <div className="relative inline-block">
                  <select className="appearance-none bg-white border border-gray-300 rounded pl-3 pr-8 py-1">
                    <option>{toStatus}</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {students.map((student, index) => (
            <div key={student.id} className="flex justify-between py-2 border-b last:border-b-0">
              <div className="w-1/3 text-gray-800">{index + 1}. {student.name}</div>
              <div className="flex w-2/3 justify-between">
                <div>{student.status}</div>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}

          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors">
              Cambiar estado
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusTab;
