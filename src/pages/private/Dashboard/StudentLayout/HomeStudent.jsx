import React, { useEffect, useState } from "react";
import { SchedulePreview } from "../../../../windows/Schedule/index";
import { studentDataService} from "./index";
import { Bell, Info, CircleX } from "lucide-react";
import { SubjectGrid } from "../../Subject";
import { Roles } from "../../../../models";
import { decodeRoles, hasAccess } from "../../../../utilities";
import { useSelector } from "react-redux";


export default function HomeStudent() {
  const [isDirectorModalOpen, setIsDirectorModalOpen] = useState(false);
  const [isNovedadesOpen, setIsNovedadesOpen] = useState(false);
  const [studentData, setStudentData] = useState(null); //  Estado para los datos del estudiante
  
  const userState = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(userState?.roles) ?? [];

  const isTeacher = hasAccess(storedRole,[Roles.TEACHER]); //  Variable para determinar si el usuario es profesor

  useEffect(() => {
    const subscription = studentDataService.getStudentData().subscribe(setStudentData);
    
    return () => subscription.unsubscribe(); //  Cancelar suscripción al desmontar
  }, []);

  return (
<div className="grid grid-cols-12 gap-6 px-6 mt-4 h-full">

{/*  SubjectGrid manejará todo el contenido principal */}
<div className="col-span-9">
  <SubjectGrid />
</div>

{/*  Panel derecho con novedades y horario */}
<div className="col-span-3 flex flex-col items-end space-y-4">
  <button 
    onClick={() => setIsNovedadesOpen(true)} 
    className="relative flex items-center gap-3 bg-gray-100 hover:shadow-md transition-shadow p-3 rounded-lg border border-gray-300"
  >
    <div className="bg-red-500 text-white rounded-full p-2">
      <Bell className="w-6 h-6" />
    </div>
    <span className="font-medium text-gray-700">Novedades</span>
  </button>

  {/*  Botones inferiores */}
  <div className="fixed bottom-6 right-6 flex space-x-4">
    <SchedulePreview />

    {!isTeacher &&(<div
      className="cursor-pointer bg-white hover:shadow-lg transition-shadow p-3 flex flex-col items-center rounded-full text-center border border-gray-300 shadow-sm"
      onClick={() => setIsDirectorModalOpen(true)}
    >
      <Info className="w-6 h-6 text-gray-600" />
      <span className="text-xs text-gray-700 font-medium mt-1">Director de grupo</span>
    </div>)}
  </div>
</div>

{/*  Modal Director de Grupo */}
{isDirectorModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-opacity-30">
    <div className="bg-white p-6 rounded-lg max-w-md shadow-lg w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Información del Director</h2>
        <button onClick={() => setIsDirectorModalOpen(false)} className="text-gray-600 hover:text-black">
          <CircleX/>
        </button>
      </div>
      <p className="mt-4 text-gray-700">
        Nombre del director: <strong>Prof. {studentData?.group?.mentor?.firstName} {studentData?.group?.mentor?.lastName}</strong>
      </p>
      <p className="text-gray-600">Contacto: {studentData?.group?.mentor?.email}</p>
    </div>
  </div>
)}

{/*  Modal Novedades */}
{isNovedadesOpen && (
  <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-opacity-30">
    <div className="bg-white p-6 rounded-lg max-w-md shadow-lg w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Últimas Novedades</h2>
        <button onClick={() => setIsNovedadesOpen(false)} className="text-gray-600 hover:text-black">
          <CircleX/>
        </button>
      </div>
      <p className="mt-4 text-gray-700">Aquí irán las últimas novedades para el estudiante.</p>
    </div>
  </div>
)}
</div>
);
}
