import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { CalendarDays, UserCircle, Search, ChevronDown, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Selector } from "../../../components";
import { configViewService } from "../Setting";
import { studentDataService, teacherDataService } from "./StudentLayout/StudentService";
import { AdminRoutes, PrivateRoutes, Roles } from "../../../models";
import { searchService } from "../../../windows/Search";
import { setSelectedUser } from "../../../redux/states/user";
import { userDataService } from "../../../services/userDataService";
import { useSubscribeToDataService, useSubscribeToService } from "../../../services/hooks";
import { decodeRoles, hasAccess } from "../../../utilities";

export default function UserTopBar({ showSelectorUser = false, showSelectorYear = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userState = useSelector(store => store.user);
  const selectedUser = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];

  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);
  const isAdmin = hasAccess(storedRole, [Roles.ADMIN]);
  const isStudent = hasAccess(storedRole, [Roles.STUDENT]);

  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Elegir el servicio de datos según el rol
  const dataService = isTeacher || isAdmin ? teacherDataService : studentDataService;

  // Suscripción al usuario
  useSubscribeToDataService(selectedUser, dataService, setStudentData, studentData);

  // Establecer el usuario actual como seleccionado cuando se carga inicialmente
  useEffect(() => {
    if (userState?.id && !selectedStudentId) {
      setSelectedStudentId(userState.id.toString());
      
      // Si no hay un usuario seleccionado en Redux, establecer el usuario actual
      if (!selectedUser?.id && userState?.id) {
        dispatch(setSelectedUser({
          id: userState.id,
          name: userState.name,
          roles: userState.roles,
          isUser: true
        }));
      }
    }
  }, [userState?.id, selectedUser, selectedStudentId, dispatch]);

  // Obtener lista de estudiantes asociados al usuario si es familiar
  useEffect(() => {
    if (!userState?.id) return;

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const response = await studentDataService.getFamilyStudents(userState.id);
        const studentsWithRoles = await Promise.all(response.map(async student => ({
          ...student,
          roles: await userDataService.getRoleGroups(student.username) || userState.roles
        })));

        //Agregar el usuario logeado
        if (response.length >= 0) {
          const userAsStudent = {
            id: userState.id,
            name: userState.name,
            roles: userState.roles,
            isUser: true // Bandera para identificar al usuario
          };

          const newStudentsList = [userAsStudent, ...studentsWithRoles];

          setStudents(prevStudents =>
            JSON.stringify(prevStudents) !== JSON.stringify(newStudentsList)
              ? newStudentsList
              : prevStudents
          );
        }
      } catch (error) {
        console.error("Error obteniendo estudiantes del familiar:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [userState?.id, selectedUser]);

  // Suscripción a los periodos
  useEffect(() => {
    const periodSubscription = configViewService.getPeriods().subscribe(setPeriods);
    return () => periodSubscription.unsubscribe();
  }, []);

  // Suscripción al período seleccionado
  useEffect(() => {
    const selectedPeriodSubscription = configViewService.getSelectedPeriod().subscribe((newPeriod) => {
      setSelectedPeriod(prevPeriod =>
        JSON.stringify(prevPeriod) !== JSON.stringify(newPeriod)
          ? newPeriod
          : prevPeriod
      );
    });

    return () => selectedPeriodSubscription.unsubscribe();
  }, []);

  const infoHeader = () => {
    if (isAdmin) return "Administrador";
    if (isTeacher) return "Profesor";
    if (isStudent) return "Estudiante";
    return "Padre de familia";
  };


  // Función para manejar el clic en el logo
  const handleLogoClick = () => {
    // Verificar si el usuario es administrador y su preferencia de vista
    const userViewMode = localStorage.getItem('userViewMode');

    if (isAdmin && userViewMode === 'admin') {
      // Si es admin y está en modo admin, ir al panel de administración
      navigate(AdminRoutes.INSTITUTION);
    } else {
      // De lo contrario, ir al dashboard
      navigate(PrivateRoutes.DASHBOARD);
    }
  };

  // Mostrar un estado de carga mejorado
  if (isLoading || !userState?.id) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 left-0 w-full h-16 bg-gray-200 flex items-center justify-between px-6"
    >
      <motion.img
        src={"/logo.png"}
        alt="Logo Colegio"
        className="h-12"
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-gray-600 font-medium"
      >
        Cargando información del usuario...
      </motion.div>
      <div className="w-12"></div> {/* Espaciador para mantener centrado el texto */}
    </motion.div>
  );

  // Fallback para cuando hay userState pero aún no hay estudiantes
  if (!students.length && userState?.id) {
    // Crear un estudiante temporal con los datos del usuario actual
    const tempStudents = [{
      id: userState.id,
      name: userState.name,
      roles: userState.roles,
      isUser: true
    }];
    
    setStudents(tempStudents);
    setSelectedStudentId(userState.id.toString());
    return null; // Retornar null para evitar renderizado durante esta actualización
  }

  const handleStudentChange = (studentId) => {
    const selected = students.find(student => student.id === parseInt(studentId));
    if (selected) {
      setSelectedStudentId(studentId);
      dispatch(setSelectedUser(selected));
      setShowUserDropdown(false);
      navigate(PrivateRoutes.DASHBOARD);
    }
  };

  const handleProfileClick = () => {
    navigate(PrivateRoutes.PROFILE, { state: { viewing: true } });
  };

  // Encontrar el nombre del estudiante seleccionado para mostrar en el selector
  // Priorizar el usuario actual durante la carga inicial
  const selectedStudentName = students.find(s => s.id === parseInt(selectedStudentId))?.name || 
    userState.name || 
    selectedUser?.name || 
    "Cargando usuario...";

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed top-0 left-0 w-full bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg z-50"
    >
      <div className="relative flex items-center justify-between px-6 py-2.5">

        {/* Logo + Información del estudiante */}
        <div className="flex items-center gap-5">
          <motion.img
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogoClick}
            src={"/logo.png"}
            alt="Logo Colegio"
            className="h-12 cursor-pointer transition-all duration-200 hover:brightness-110"
          />

          {/* Selector de usuario */}
          {showSelectorUser ? (
            <div className="relative">
              <motion.button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <UserCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-800">
                  {selectedStudentName}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${showUserDropdown ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-300 z-50 overflow-hidden"
                  >
                    <div className="max-h-60 overflow-y-auto tailwind-scrollbar">
                      {students.map(student => (
                        <motion.div
                          key={student.id}
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          className={`px-4 py-3 cursor-pointer border-b border-gray-100 flex items-center gap-3 
                                                      ${parseInt(selectedStudentId) === student.id ? 'bg-blue-50' : ''}`}
                          onClick={() => handleStudentChange(student.id)}
                        >
                          <UserCircle className={`w-6 h-6 ${student.isUser ? 'text-blue-600' : 'text-gray-600'}`} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-500">
                              {student.isUser ? "Usuario principal" : "Estudiante asociado"}
                            </p>
                          </div>
                          {parseInt(selectedStudentId) === student.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-sm font-medium text-gray-900 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-300">
              {userState.name || "Cargando..."}
            </div>
          )}
        </div>

        {/* Barra de búsqueda */}
        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => searchService.open()}
          className="w-60 bg-white text-gray-700 px-4 py-2.5 rounded-full flex items-center justify-between shadow-sm border border-gray-300 hover:border-gray-400 transition-all duration-200"
        >
          <span className="text-gray-500">Buscar en el sistema...</span>
          <Search className="w-5 h-5 text-blue-600" />
        </motion.button> */}

        {/* Selector de Periodo + Otros Controles */}
        <div className="flex items-center gap-5">
          {/* Información del grupo/rol */}
          <motion.div
            whileHover={{ y: -2 }}
            className="px-4 py-2 bg-blue-50 text-blue-800 rounded-lg shadow-sm border border-blue-200"
          >
            <span className="text-sm font-semibold">{infoHeader()}</span>
          </motion.div>

          {/* Año actual */}
          <motion.div
            whileHover={{ y: -2 }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-300"
          >
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-800">{new Date().getFullYear()}</span>
          </motion.div>

          {/* Selector de período */}
          
          <div className="relative">
            <Selector
              selectedItem={selectedPeriod}
              setSelectedItem={configViewService.setSelectedPeriod}
              items={periods}
              itemKey="id"
              itemLabel="name"
              placeholder="Seleccione un período"
              className="bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 text-sm"
            />
          </div>

          {/* Botón de perfil */}
        <motion.button
          onClick={handleProfileClick}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
        >
          <UserCircle className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Perfil</span>
        </motion.button>

        </div>
      </div>
    </motion.div>
  );
}