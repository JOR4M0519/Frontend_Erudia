import React from "react";
import { ChevronDown, ChevronUp, BookOpen, User, School, Clipboard, Trash2 } from "lucide-react";
import { Droppable, Draggable } from "react-beautiful-dnd";

const GroupsView = ({
  loading,
  groupByType,
  groupedAssignments,
  expandedItems,
  toggleItem,
  editMode,
  handleStartCopy,
  handleDeleteAssignment,
  getProfessorFullName,
  unassignedSubjects
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vista agrupada por grupos */}
      {groupByType === "group" && (
        <>
          {Object.keys(groupedAssignments).length > 0 ? (
            Object.keys(groupedAssignments).map(key => {
              const groupData = groupedAssignments[key];
              const group = groupData.group;
              const subjects = groupData.subjects;
              const isExpanded = expandedItems[`group-${key}`] || false;
              
              return (
                <div 
                  key={`group-${key}`} 
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleItem(`group-${key}`)}
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-amber-50">
                        <School size={20} className="text-amber-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{group.groupName} ({group.groupCode})</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{group.level?.levelName}</span>
                          <span className="mx-2">•</span>
                          <span>{subjects.length} {subjects.length === 1 ? 'materia' : 'materias'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <Droppable droppableId={`group-${group.id}`} isDropDisabled={!editMode}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`mt-2 border rounded-md ${editMode ? 'border-dashed border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                          >
                            {subjects.length > 0 ? (
                              <ul className="divide-y divide-gray-200">
                                {subjects.map((subject, index) => (
                                  <li key={subject.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                    <div className="flex items-center">
                                      <div className="p-1.5 rounded-full bg-blue-50">
                                        <BookOpen size={16} className="text-blue-600" />
                                      </div>
                                      <div className="ml-3">
                                        <div className="font-medium">
                                          {subject.subjectProfessor.subject.subjectName}
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center">
                                          <User size={14} className="mr-1" />
                                          {getProfessorFullName(subject.subjectProfessor.professor)}
                                          <span className="mx-1">•</span>
                                          <span>{subject.period.name}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {editMode && (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteAssignment(subject.id);
                                          }}
                                          className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
                                          title="Eliminar asignación"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                {editMode 
                                  ? "Arrastre materias aquí para asignarlas a este grupo" 
                                  : "No hay materias asignadas a este grupo"}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No se encontraron grupos con los filtros aplicados
            </div>
          )}
        </>
      )}

      {/* Vista agrupada por materias-profesor */}
      {groupByType === "subject" && (
        <>
          {Object.keys(groupedAssignments).length > 0 ? (
            Object.keys(groupedAssignments).map(key => {
              const subjectData = groupedAssignments[key];
              const subjectProfessor = subjectData.subjectProfessor;
              const groups = subjectData.groups;
              const isExpanded = expandedItems[`subject-${key}`] || false;
              
              return (
                <div 
                  key={`subject-${key}`} 
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleItem(`subject-${key}`)}
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-50">
                        <BookOpen size={20} className="text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{subjectProfessor.subject.subjectName}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <User size={14} className="mr-1" />
                          <span>{getProfessorFullName(subjectProfessor.professor)}</span>
                          <span className="mx-2">•</span>
                          <span>{groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartCopy(subjectProfessor);
                          }}
                          className="p-1.5 rounded-full hover:bg-blue-50 text-blue-500"
                          title="Copiar a múltiples grupos"
                        >
                          <Clipboard size={16} />
                        </button>
                      )}
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <Droppable droppableId={`subject-professor-${subjectProfessor.id}`} isDropDisabled={!editMode}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`mt-2 border rounded-md ${editMode ? 'border-dashed border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                          >
                            {groups.length > 0 ? (
                              <ul className="divide-y divide-gray-200">
                                {groups.map((groupItem, index) => (
                                  <Draggable
                                    key={groupItem.id}
                                    draggableId={`group-item-${groupItem.id}`}
                                    index={index}
                                    isDragDisabled={!editMode}
                                  >
                                    {(provided) => (
                                      <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="p-3 flex justify-between items-center hover:bg-gray-50"
                                      >
                                        <div className="flex items-center">
                                          <div className="p-1.5 rounded-full bg-amber-50">
                                            <School size={16} className="text-amber-600" />
                                          </div>
                                          <div className="ml-3">
                                            <div className="font-medium">
                                              {groupItem.group.groupName} ({groupItem.group.groupCode})
                                            </div>
                                            <div className="text-sm text-gray-500">
                                              <span>{groupItem.group.level?.levelName}</span>
                                              <span className="mx-1">•</span>
                                              <span>{groupItem.period.name}</span>
                                            </div>
                                          </div>
                                        </div>
                                        {editMode && (
                                          <div className="flex gap-2">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAssignment(groupItem.id);
                                              }}
                                              className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
                                              title="Eliminar asignación"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        )}
                                      </li>
                                    )}
                                  </Draggable>
                                ))}
                              </ul>
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                {editMode 
                                  ? "Arrastre grupos aquí para asignarlos a esta materia" 
                                  : "No hay grupos asignados a esta materia"}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No se encontraron materias con los filtros aplicados
            </div>
          )}
          
          {/* Materias sin asignaciones */}
          {unassignedSubjects.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
              <div className="p-4 border-b">
                <h3 className="font-medium">Materias sin asignaciones ({unassignedSubjects.length})</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {unassignedSubjects.map(subject => (
                  <li key={subject.id} className="p-3 flex items-center">
                    <div className="p-1.5 rounded-full bg-gray-100">
                      <BookOpen size={16} className="text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{subject.subjectName}</div>
                      <div className="text-sm text-gray-500">{subject.subjectCode || 'Sin código'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupsView;
