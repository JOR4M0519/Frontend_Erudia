import { useState } from "react";
import { Clipboard, Search, X, BookOpen, User } from "lucide-react";
import { Droppable, Draggable } from "react-beautiful-dnd";

const SubjectsPanel = ({ 
  availableSubjectProfessors, 
  panelSearchTerm, 
  setPanelSearchTerm,
  levelFilter,
  setLevelFilter,
  levels,
  onCopyMultiple,
  onClose
}) => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  
  const toggleSubjectSelection = (subjectProfessor) => {
    if (selectedSubjects.some(s => s.id === subjectProfessor.id)) {
      setSelectedSubjects(selectedSubjects.filter(s => s.id !== subjectProfessor.id));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectProfessor]);
    }
  };
  
  const handleCopyMultiple = () => {
    if (selectedSubjects.length === 0) {
      alert("Seleccione al menos una materia para copiar");
      return;
    }
    onCopyMultiple(selectedSubjects);
  };

  return (
    <div className="md:w-1/3 bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Materias disponibles</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={panelSearchTerm}
            onChange={(e) => setPanelSearchTerm(e.target.value)}
            placeholder="Buscar materia..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mt-2">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las áreas</option>
            {levels && levels.map(level => (
              <option key={level.id} value={level.id}>
                {level.levelName}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Botón de copia múltiple */}
      {selectedSubjects.length > 0 && (
        <div className="mb-3 flex justify-between items-center bg-blue-50 p-2 rounded-md">
          <span className="text-sm text-blue-700">
            {selectedSubjects.length} {selectedSubjects.length === 1 ? 'materia' : 'materias'} seleccionada(s)
          </span>
          <button
            onClick={handleCopyMultiple}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center"
          >
            <Clipboard size={14} className="mr-1" />
            Copiar
          </button>
        </div>
      )}
      
      <Droppable droppableId="subjects-panel">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="overflow-y-auto max-h-[calc(100vh-300px)]"
          >
            {availableSubjectProfessors.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {availableSubjectProfessors.map((subjectProfessor, index) => (
                  <Draggable
                    key={subjectProfessor.id}
                    draggableId={`panel-subject-${subjectProfessor.id}`}
                    index={index}
                  >
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-3 flex items-center hover:bg-gray-50 cursor-grab ${
                          selectedSubjects.some(s => s.id === subjectProfessor.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => toggleSubjectSelection(subjectProfessor)}
                      >
                        <div className={`p-1.5 rounded-full ${
                          selectedSubjects.some(s => s.id === subjectProfessor.id) 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <BookOpen size={16} />
                        </div>
                        <div className="ml-3 flex-grow">
                          <div className="font-medium">{subjectProfessor.subject.subjectName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <User size={14} className="mr-1" />
                            {`${subjectProfessor.professor.firstName || ''} ${subjectProfessor.professor.lastName || ''}`.trim() || 'Sin profesor'}
                          </div>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No se encontraron materias con los filtros aplicados
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <div className="mt-4 text-sm text-gray-500 p-2 bg-gray-50 rounded-md">
        <p>Arrastre las materias hacia los grupos para crear asignaciones.</p>
        <p className="mt-1">Recuerde seleccionar un periodo académico antes de arrastrar.</p>
        <p className="mt-1">También puede seleccionar varias materias para copiarlas a múltiples grupos.</p>
      </div>
    </div>
  );
};

export default SubjectsPanel;
