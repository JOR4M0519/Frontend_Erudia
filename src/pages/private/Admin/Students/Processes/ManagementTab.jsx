import React, { useState } from "react";
import { Edit, ChevronDown } from "lucide-react";

const ManagementTab = ({ year }) => {
  const [studentInfo, setStudentInfo] = useState({
    documento: "10004235452",
    nombre: "Jessica Sofia",
    apellidos: "Rivera Burabo",
    sexo: "Femenino",
    fechaNacimiento: "12/08/1978",
    grado: "Segundo",
    curso: "B",
    estado: "Activo"
  });

  const [editMode, setEditMode] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-800">Información personal</h3>
        <button 
          onClick={() => setEditMode(!editMode)}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Edit className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(studentInfo).map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/4 font-medium text-gray-700 capitalize mb-1 sm:mb-0">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="w-full sm:w-3/4">
              {editMode ? (
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded p-2"
                  value={value}
                  onChange={(e) => setStudentInfo({...studentInfo, [key]: e.target.value})}
                />
              ) : (
                <div className="bg-gray-50 p-2 rounded">{value}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-between items-center mt-8">
        <div className="flex space-x-4">
          <div className="relative">
            <select className="appearance-none bg-gray-200 border border-gray-300 rounded-lg pl-3 pr-8 py-2">
              <option>Segundo</option>
              <option>Primero</option>
              <option>Tercero</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
          </div>
          <div className="relative">
            <select className="appearance-none bg-gray-200 border border-gray-300 rounded-lg pl-3 pr-8 py-2">
              <option>B</option>
              <option>A</option>
              <option>C</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
          </div>
          <div className="relative">
            <select className="appearance-none bg-gray-200 border border-gray-300 rounded-lg pl-3 pr-8 py-2">
              <option>Activo</option>
              <option>Pendiente</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
          </div>
        </div>
        <button className="px-6 py-2 mt-4 sm:mt-0 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors">
          Agregar
        </button>
      </div>
    </div>
  );
};

export default ManagementTab;
