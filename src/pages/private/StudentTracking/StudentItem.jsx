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
            {observation?.student?.firstName ?? ""} {observation?.student?.lastName ?? ""}
          </div>
          <div className="col-span-3 text-gray-700">{observation?.situation ?? "Sin situación"}</div>
          <div className="col-span-2 text-center text-gray-600">
            {observation?.period?.startDate ?? "Sin fecha"}
          </div>
          <div className="col-span-2 text-center text-gray-700">
            {observation?.trackingType?.type ?? "Sin tipo"}
          </div>
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
          <div className="col-span-4 font-medium text-gray-700">{observation?.situation ?? "Sin situación"}</div>
          <div className="col-span-4 text-center text-gray-600">
            {observation?.period?.startDate ?? "Sin fecha"}
          </div>
          <div className="col-span-4 text-center text-gray-700">
            {observation?.professor?.firstName ?? ""} {observation?.professor?.lastName ?? ""}
          </div>
        </>
      )}
    </div>
  );
}
