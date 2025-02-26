import React from "react";
import { Edit, Trash } from "lucide-react";

export default function StudentItem({
  observation,
  isTeacher,
  onEditObservation,
  onDeleteObservation,
  onItemClick,
}) {
  return (
    <div
      onClick={() => onItemClick(observation)}
      className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-300 transition-colors items-center cursor-pointer rounded-lg bg-gray-200 m-2"
    >
      {isTeacher ? (
        <>
          <div className="col-span-3 font-medium text-gray-700">
            {observation.student.firstName} {observation.student.lastName}
          </div>
          <div className="col-span-3 text-gray-700">{observation.title}</div>
          <div className="col-span-2 text-center text-gray-600">{observation.date}</div>
          <div className="col-span-2 text-center text-gray-700">{observation.student.course}</div>
          <div className="col-span-2 text-center flex justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => onEditObservation(observation, e)}
              className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => onDeleteObservation(observation, e)}
              className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="col-span-4 font-medium text-gray-700">{observation.title}</div>
          <div className="col-span-4 text-center text-gray-600">{observation.date}</div>
          <div className="col-span-4 text-center text-gray-700">
            {observation.teacher.firstName} {observation.teacher.lastName}
          </div>
        </>
      )}
    </div>
  );
}
