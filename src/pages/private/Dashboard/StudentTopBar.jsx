import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { CalendarDays, UserCircle, Search } from "lucide-react";
import { Selector } from "../../../components";
import { configViewService } from "../Setting";
import { studentDataService } from "./StudentLayout/StudentService";
import { PrivateRoutes } from "../../../models";
import { searchService } from "../../../windows/Search";
import { setSelectedUser } from "../../../redux/states/user";

export default function StudentTopBar() {
  const dispatch = useDispatch();
  const userState = useSelector(store => store.user);
  const selectedUser = useSelector(store => store.selectedUser);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const periodSubscription = configViewService.getPeriods().subscribe(setPeriods);
    return () => periodSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = studentDataService.getStudentData().subscribe(setStudentData);
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userState?.id) return;

    const fetchStudents = async () => {
      try {
        const response = await studentDataService.getFamilyStudents(userState.id);
        
        const studentsWithRoles = response.map(student => ({
          ...student,
          roles: userState.roles // Agregar los roles del usuario a cada estudiante
        }));

        if (response.length > 0) {
          const userAsStudent = {
            id: userState.id,
            name: userState.name,
            roles: userState.roles,
            isUser: true // Puedes agregar una bandera para identificar al usuario
          };
  
          // Agregar al usuario como el primer elemento de la lista
          setStudents([userAsStudent, ...studentsWithRoles]);
        }
      } catch (error) {
        console.error("Error obteniendo estudiantes del familiar:", error);
      }
    };

    fetchStudents();
  }, [userState?.id, dispatch]);

  useEffect(() => {
    const selectedPeriodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
    return () => selectedPeriodSubscription.unsubscribe();
  }, []);

  if (!students.length) return <p className="text-gray-500">Cargando estudiantes...</p>;

  const handleStudentChange = (studentId) => {
    const selected = students.find(student => student.id === parseInt(studentId));
    if (selected) {
      setSelectedStudentId(studentId);
      dispatch(setSelectedUser(selected));
      studentDataService.clearSubjects(); // Limpiar datos antiguos
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-gray-200 shadow-md z-50">
      <div className="relative flex items-center justify-between px-6 py-2">
        
        {/* 🔹 Logo + Información del estudiante */}
        <div className="flex items-center gap-4">
          <img src={"/logo.png"} alt="Logo Colegio" className="h-10" />
          <div>
            <Selector
              selectedItem={selectedStudentId}
              setSelectedItem={handleStudentChange}
              items={students}
              itemKey="id"
              itemLabel="name"
              placeholder="Seleccionar estudiante"
            />
            <p className="text-sm text-gray-600">{studentData?.group?.groupName || "Grupo"}</p>
          </div>
        </div>

        {/* 🔹 Barra de búsqueda */}
        <div className="relative w-60">
          <button
            onClick={() => { searchService.open(); }}
            className="w-full bg-gray-300 text-gray-700 px-4 py-3 rounded-full focus:ring-2 focus:ring-blue-300 flex items-center justify-between shadow-sm"
          >
            Buscar 
            <Search className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 🔹 Selector de Periodo + Otros Controles */}
        <div className="relative flex items-center gap-6 bg-gray-300 px-8 py-2 rounded-full shadow-md border border-gray-400">
          {/* 🔹 Grado */}
          <span className="text-sm font-semibold text-gray-700">
            {studentData?.group?.groupName || "Sin Grupo"}
          </span>

          {/* 🔹 Año actual */}
          <div className="flex items-center gap-1 text-gray-700">
            <CalendarDays className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">{new Date().getFullYear()}</span>
          </div>

          {/* 🔹 Selector de período usando RxJS */}
          <Selector
            selectedItem={selectedPeriod}
            setSelectedItem={(value) => configViewService.setSelectedPeriod(value)}
            items={periods}
            itemKey="id"
            itemLabel="name"
            placeholder="Seleccione un período"
          />

          {/* 🔹 Botón de perfil */}
          <NavLink
            to={PrivateRoutes.PROFILE}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-1 rounded-full shadow-sm border border-gray-400 transition-all
              ${isActive ? "bg-gray-400" : "bg-gray-300 hover:bg-gray-400"}`
            }
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-sm font-medium text-gray-700">Perfil</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
