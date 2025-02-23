import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { CalendarDays, UserCircle, Search } from "lucide-react";
import { Selector } from "../../../components";
import { configViewService } from "../Setting";
import { studentDataService, teacherDataService } from "./StudentLayout/StudentService";
import { PrivateRoutes } from "../../../models";
import { searchService } from "../../../windows/Search";
import { setSelectedUser } from "../../../redux/states/user";
import { userDataService } from "../../../services/userDataService";
import { useSubscribeToDataService , useSubscribeToService } from "../../../services/hooks";
import { decodeRoles, hasAccess } from "../../../utilities";


export default function StudentTopBar({showSelectorUser=false,showSelectorYear=false}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userState = useSelector(store => store.user);
  const selectedUser = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];

  const isTeacher = hasAccess(storedRole, ["profesor"]);
  const isAdmin = hasAccess(storedRole, ["admin"]);
  const isStudent = hasAccess(storedRole, ["estudiante"]);

  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentData, setStudentData] = useState(null);

  // Elegir el servicio de datos según el rol
  const dataService = isTeacher || isAdmin ? teacherDataService : studentDataService;

  // Suscripción al usuario
  useSubscribeToDataService(selectedUser, dataService, setStudentData, studentData);

  // Obtener lista de estudiantes asociados al usuario si es familiar
  useEffect(() => {
    if (!userState?.id) return;
  
    const fetchStudents = async () => {
      try {
        const response = await studentDataService.getFamilyStudents(userState.id);

        const studentsWithRoles = await Promise.all(response.map(async student => ({
          ...student,
          roles: await userDataService.getRoleGroups(student.username) || userState.roles // Agregar los roles del usuario a cada estudiante-En caso que no tenga agregar roles del usuario logeado
        })));

        
        //Agregar el usuario logeado
        if (response.length > 0) {
          const userAsStudent = {
            id: userState.id,
            name: userState.name,
            roles: userState.roles,
            isUser: true // Bandera para identificar al usuario
          };
          
          const newStudentsList = [userAsStudent, ...studentsWithRoles];
          
          //  Verificar si la nueva lista de estudiantes es diferente antes de actualizar el estado
          setStudents(prevStudents => 
            JSON.stringify(prevStudents) !== JSON.stringify(newStudentsList) 
              ? newStudentsList 
              : prevStudents
          );
        }
      } catch (error) {
        console.error("Error obteniendo estudiantes del familiar:", error);
      }
    };
  
    fetchStudents();
  }, [userState?.id]); // Quitamos `dispatch` si no se usa dentro del efecto
  
//  Suscripción al período seleccionado
  useEffect(() => {
    const periodSubscription = configViewService.getPeriods().subscribe(setPeriods);
    return () => periodSubscription.unsubscribe();
  }, []);
  // Suscribirse al período seleccionado
//useSubscribeToService(configViewService.getSelectedPeriod, setSelectedPeriod, selectedPeriod);


  //  Suscripción a los periodos que ecperíodo seleccionado
  useEffect(() => {
    const selectedPeriodSubscription = configViewService.getSelectedPeriod().subscribe((newPeriod) => {
      setSelectedPeriod(prevPeriod => 
        JSON.stringify(prevPeriod) !== JSON.stringify(newPeriod) 
          ? newPeriod 
          : prevPeriod
      );
    });
  
    return () => selectedPeriodSubscription.unsubscribe();
  }, []); // 🔹 Se ejecuta solo una vez al montar el componente
  // Suscribirse a los períodos disponibles
  //useSubscribeToService(configViewService.getPeriods, setPeriods);

  const infoHeader= () =>{
    if(isAdmin) return "Administrador"
    
    if(isTeacher) return "Profesor"
    return studentData?.group?.groupName
  } 


  if (!students.length) return <p className="text-gray-500">Cargando estudiantes...</p>;

  const handleStudentChange = (studentId) => {
    const selected = students.find(student => student.id === parseInt(studentId));
    if (selected) {
      setSelectedStudentId(studentId);
      dispatch(setSelectedUser(selected));
      //studentDataService.clearSubjects(); // Limpiar datos antiguos
      navigate(PrivateRoutes.DASHBOARD);
    }
  };

  const handleProfileClick = () => {
    navigate(PrivateRoutes.PROFILE, { state: { viewing: true } }); // 🔹 Pasa `state`
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-gray-200 shadow-md z-50">
      <div className="relative flex items-center justify-between px-6 py-2">
        
        {/* 🔹 Logo + Información del estudiante */}
        <div className="flex items-center gap-4">
          <img src={"/logo.png"} alt="Logo Colegio" className="h-10" />
          <div>
            <h4 className="text-sm font-medium text-black">Usuario:</h4>
            {showSelectorUser ? (
              <Selector
                selectedItem={selectedStudentId}
                setSelectedItem={handleStudentChange}
                items={students}
                itemKey="id"
                itemLabel="name"
                placeholder={students.name || "Seleccionar Usuario"}
              />
            ) : userState.name}
          </div>
        </div>

        {/* 🔹 Barra de búsqueda */}
        <div className="relative w-60">
          <button
            onClick={() => searchService.open()}
            className="w-full bg-gray-300 text-gray-700 px-4 py-3 rounded-full flex items-center justify-between shadow-sm"
          >
            Buscar
            <Search className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 🔹 Selector de Periodo + Otros Controles */}
        <div className="relative flex items-center gap-6 bg-gray-300 px-8 py-2 rounded-full shadow-md border border-gray-400">
          
          {/* 🔹 Información del grupo del usuario */}
          <span className="text-sm font-semibold text-gray-700">
            {infoHeader()}
          </span>

          {/* 🔹 Año actual */}
          <div className="flex items-center gap-1 text-gray-700">
            <CalendarDays className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">{new Date().getFullYear()}</span>
          </div>

          {/* 🔹 Selector de período */}
          <Selector
            selectedItem={selectedPeriod}
            setSelectedItem={configViewService.setSelectedPeriod}
            items={periods}
            itemKey="id"
            itemLabel="name"
            placeholder="Seleccione un período"
          />

          {/* 🔹 Botón de perfil */}
          <button onClick={handleProfileClick} className="cursor-pointer flex items-center gap-2 px-4 py-1 rounded-full shadow-sm border border-gray-400 bg-gray-300 hover:bg-gray-400">
            {/* <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"> */}
              <UserCircle className="w-6 h-6 text-gray-700" />
            {/* </div> */}
            <span className="text-sm font-medium text-gray-700">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}