import React from "react";
import { Users, ChevronRight, School, Calendar } from "lucide-react";

const DirectionGroupCard = ({ group, onClick }) => {
  if (!group) return null;
  
  // Genera un color basado en el ID del grupo para mantener consistencia
  const getGroupColor = (id) => {
    const colors = [
      { bg: "bg-blue-100", accent: "bg-blue-500", text: "text-blue-700", hover: "hover:bg-blue-50" },
      { bg: "bg-emerald-100", accent: "bg-emerald-500", text: "text-emerald-700", hover: "hover:bg-emerald-50" },
      { bg: "bg-amber-100", accent: "bg-amber-500", text: "text-amber-700", hover: "hover:bg-amber-50" },
      { bg: "bg-violet-100", accent: "bg-violet-500", text: "text-violet-700", hover: "hover:bg-violet-50" },
      { bg: "bg-rose-100", accent: "bg-rose-500", text: "text-rose-700", hover: "hover:bg-rose-50" }
    ];
    
    const colorIndex = typeof id === 'number' 
      ? id % colors.length 
      : parseInt(id?.toString().replace(/[^\d]/g, '') || '0', 10) % colors.length;
      
    return colors[colorIndex];
  };
  
  const colorScheme = getGroupColor(group.id);
  const studentCount = group.students?.length || 0;
  
  // Función para formatear el nombre del grupo de manera más limpia
  const formatGroupName = () => {
    if (!group.groupName) return "Sin nombre";
    return group.groupName.trim();
  };
  
  return (
    <div 
      className={`rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer
                 border border-gray-200 overflow-hidden transform hover:scale-102`}
      onClick={() => onClick(group)}
    >
      <div className={`${colorScheme.bg} p-5`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <div className={`${colorScheme.accent} h-10 w-10 rounded-full flex items-center justify-center mr-3`}>
                <School size={20} className="text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-lg ${colorScheme.text}`}>
                  {formatGroupName()}
                </h3>
                {group.groupCode && (
                  <span className={`text-sm ${colorScheme.text} opacity-80`}>
                    Código: {group.groupCode}
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-2 mt-3">
              <div className="flex items-center text-gray-600">
                <Users size={16} className="mr-2" />
                <span className="text-sm">
                  {studentCount} {studentCount === 1 ? 'estudiante' : 'estudiantes'}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-2" />
                <span className="text-sm">
                  {group.level || "Sin nivel"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <ChevronRight size={20} className="opacity-70" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-3 flex justify-between items-center border-t border-gray-100">
        <span className="text-xs font-medium text-gray-500 uppercase">Dirección de grupo</span>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
};

export default DirectionGroupCard;