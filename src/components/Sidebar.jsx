import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  Settings,
  Search,
  BookUser,
  NotebookText,
  BookType,
  ShieldPlus,
  ChevronDown,
  StarIcon,
  Building,
  Users,
  FileText,
  LayoutDashboard,
  SwitchCamera
} from "lucide-react";
import Logout from "./Logout";
import { PrivateRoutes, SideBarRoles, AdminRoutes, Roles } from "../models";
import { decodeRoles, hasAccess } from "../utilities";

export default function Sidebar() {
  const userState = useSelector(store => store.user);
  const selectedUser = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(selectedUser?.roles || userState?.roles) || [];
  const navigate = useNavigate();

  // Determinar si el usuario es admin, estudiante o profesor
  const isAdmin = storedRole.includes(Roles.ADMIN);
  const isStudent = storedRole.includes(Roles.STUDENT);
  const isTeacher = storedRole.includes(Roles.TEACHER);
  
  // Automáticamente usar el modo admin si el usuario tiene ese rol
  const [viewMode, setViewMode] = useState(() => {
    // Verificar si la ruta actual es administrativa
    const isAdminRoute = window.location.pathname.startsWith(AdminRoutes.ROOT);
    return isAdmin && isAdminRoute ? "admin" : "default";
  });
  const location = useLocation();

  // Actualizar el modo de visualización cuando cambia la ubicación
  useEffect(() => {
    // Verificar si la ruta actual comienza con /admin (sin el *)
    if (location.pathname.startsWith(AdminRoutes.ROOT)) {
      setViewMode("admin");
    } else if (!location.pathname.startsWith(AdminRoutes.ROOT) && viewMode === "admin") {
      setViewMode("default");
    }
  }, [location.pathname]);

  // Elementos de navegación para estudiantes
  const studentNavItems = [
    { navKey: "DASHBOARD", to: PrivateRoutes.DASHBOARD, icon: <Home className="h-5 w-5" />, label: "Inicio" },
    { navKey: "SUBJECTS", to: PrivateRoutes.SUBJECTS, icon: <BookType className="h-5 w-5" />, label: "Materias" },
    { navKey: "ACTIVITIES", to: PrivateRoutes.ACTIVITIES, icon: <NotebookText className="h-5 w-5" />, label: "Actividades" },
    { navKey: "GRADES", to: PrivateRoutes.GRADES, icon: <StarIcon className="h-5 w-5" />, label: "Mis Notas" },
    { navKey: "PROFILE", to: PrivateRoutes.PROFILE, icon: <User className="h-5 w-5" />, label: "Perfil" },
    { navKey: "SETTINGS", to: PrivateRoutes.SETTINGS, icon: <Settings className="h-5 w-5" />, label: "Configuraciones" },
  ];

  // Elementos de navegación para profesores
  const teacherNavItems = [
    { navKey: "DASHBOARD", to: PrivateRoutes.DASHBOARD, icon: <Home className="h-5 w-5" />, label: "Inicio" },
    { navKey: "SUBJECTS", to: PrivateRoutes.SUBJECTS, icon: <BookType className="h-5 w-5" />, label: "Mis Materias" },
    { navKey: "ACTIVITIES_GRADING", to: PrivateRoutes.ACTIVITIES_GRADING, icon: <NotebookText className="h-5 w-5" />, label: "Calificar" },
    { navKey: "STUDENTTRACKING", to: PrivateRoutes.STUDENTTRACKING, icon: <BookUser className="h-5 w-5" />, label: "Observador" },
    { navKey: "PROFILE", to: PrivateRoutes.PROFILE, icon: <User className="h-5 w-5" />, label: "Perfil" },
    { navKey: "SETTINGS", to: PrivateRoutes.SETTINGS, icon: <Settings className="h-5 w-5" />, label: "Configuraciones" },
  ];

  // Elementos de navegación para administradores utilizando AdminRoutes
  const adminNavItems = [
    { 
      navKey: "ADMIN", 
      to: AdminRoutes.INSTITUTION, 
      icon: <Building className="h-5 w-5" />, 
      label: "Institución",
      isAdminRoute: true,
      subItems: [
        { to: AdminRoutes.INSTITUTION_CONFIG, label: "Configuración", navKey: "ADMIN", isAdminRoute: true },
        { to: AdminRoutes.INSTITUTION_REPORTS, label: "Reportes", navKey: "ADMIN", isAdminRoute: true }
      ]
    },
    { 
      navKey: "ADMIN", 
      icon: <Users className="h-5 w-5" />, 
      label: "Usuarios",
      isAdminRoute: true,
      subItems: [
        { to: AdminRoutes.STUDENTS, label: "Estudiantes", navKey: "ADMIN", isAdminRoute: true,
          subItems: [
            { to: AdminRoutes.STUDENTS_REPORTS, label: "Reportes", navKey: "ADMIN", isAdminRoute: true },
            { to: AdminRoutes.STUDENTS_PROCESSES, label: "Procesos", navKey: "ADMIN", isAdminRoute: true }
          ]
        },
        { to: AdminRoutes.EMPLOYEES, label: "Empleados", navKey: "ADMIN", isAdminRoute: true,
          subItems: [
            { to: AdminRoutes.EMPLOYEES_CONSOLIDATED, label: "Consolidado", navKey: "ADMIN", isAdminRoute: true },
            { to: AdminRoutes.EMPLOYEES_ADD, label: "Agregar", navKey: "ADMIN", isAdminRoute: true }
          ]
        }
      ]
    },
    { 
      navKey: "ADMIN", 
      to: AdminRoutes.ACADEMY, 
      icon: <BookType className="h-5 w-5" />, 
      label: "Academia",
      isAdminRoute: true,
      subItems: [
        { to: AdminRoutes.ACADEMY_REPORTS, label: "Reportes", navKey: "ADMIN", isAdminRoute: true },
        { to: AdminRoutes.ACADEMY_CONFIG, label: "Configuración", navKey: "ADMIN", isAdminRoute: true },
        { to: AdminRoutes.ACADEMY_PROCESSES, label: "Procesos", navKey: "ADMIN", isAdminRoute: true },
        { to: AdminRoutes.ACADEMY_SCHEDULE, label: "Horario", navKey: "ADMIN", isAdminRoute: true }
      ]
    },
    { 
      navKey: "ADMIN", 
      to: AdminRoutes.SYSTEM, 
      icon: <Settings className="h-5 w-5" />, 
      label: "Sistema",
      isAdminRoute: true,
      subItems: [
        { to: AdminRoutes.SYSTEM_USER, label: "Usuario", navKey: "ADMIN", isAdminRoute: true },
        { to: AdminRoutes.SYSTEM_REGISTER, label: "Registro", navKey: "ADMIN", isAdminRoute: true },
        { to: AdminRoutes.SYSTEM_MAINTENANCE, label: "Mantenimiento", navKey: "ADMIN", isAdminRoute: true },
        { to: AdminRoutes.SYSTEM_APPEARANCE, label: "Apariencia", navKey: "ADMIN", isAdminRoute: true }
      ]
    }
  ];

  // Determinar qué elementos de navegación mostrar según el rol y el modo de visualización
  let navItems = [];
  
  if (viewMode === "admin" && isAdmin) {
    navItems = adminNavItems;
  } else {
    if (isStudent) {
      navItems = studentNavItems;
    } else if (isTeacher) {
      navItems = teacherNavItems;
    } else {
      navItems = studentNavItems; // Fallback a estudiante si no hay rol específico
    }
  }
  
  // Si el usuario es administrador, agregar el botón de cambio de vista al final
  if (isAdmin) {
    const switchItem = {
      navKey: "ADMIN",
      icon: <SwitchCamera className="h-5 w-5" />,
      label: viewMode === "admin" ? "Ver como usuario" : "Ver como administrador",
      action: () => {
        const newMode = viewMode === "admin" ? "default" : "admin";
        setViewMode(newMode);
        
        // Navegar a la ruta correspondiente
        if (newMode === "admin") {
          navigate(AdminRoutes.INSTITUTION); // Ruta principal de admin
        } else {
          navigate(PrivateRoutes.DASHBOARD); // Ruta principal de usuario
        }
      }
    };
    navItems.push(switchItem);
  }
  

  return (
<aside className="flex flex-col h-full bg-white">
  {/* Título del panel con padding adecuado */}
  <div className="p-3 border-b sticky top-5 bg-white z-10">
    <h2 className="text-xl font-bold text-gray-800">
      {viewMode === "admin" ? "Panel Admin" : "Mi Portal"}
    </h2>
  </div>
  
  {/* Contenedor de navegación con scrollbar de Tailwind */}
  <nav className="space-y-1 px-3 py-7 flex-1 overflow-y-auto 
  scrollbar scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
    {navItems.map((item, index) => (
      <NavItem key={index} {...item} userRoles={storedRole} />
    ))}
  </nav>

  {/* Footer con botón de logout */}
  <div className="p-4 border-t mt-auto bg-white sticky bottom-0 shadow-inner">
    <Logout />
  </div>
</aside>

  );
}

function NavItem({ to, icon, label, subItems, navKey, userRoles, action, isAdminRoute }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Verificar si la ruta actual es una subruta de la ruta actual
  const isActiveRoute = to && (location.pathname === to || location.pathname.startsWith(`${to}/`));
  
  // Para rutas de administración, verificar si estamos en cualquier subruta
  const isActiveAdminRoute = isAdminRoute && to && location.pathname.startsWith(to);
  
  // Si hay subitems, expandir automáticamente si estamos en una de sus rutas
  useEffect(() => {
    if (subItems && subItems.some(subItem => 
      location.pathname === subItem.to || 
      location.pathname.startsWith(`${subItem.to}/`) ||
      (subItem.subItems && subItem.subItems.some(nestedItem => 
        location.pathname === nestedItem.to || 
        location.pathname.startsWith(`${nestedItem.to}/`)
      ))
    )) {
      setIsOpen(true);
    }
  }, [location.pathname, subItems]);
  
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        {to ? (
          <NavLink
            to={to}
            end={!isAdminRoute} // No usar 'end' para rutas de admin para que se mantenga activo en subrutas
            className={({ isActive }) => `
              flex items-center space-x-3 p-3 w-full rounded-lg transition-colors
              ${(isActive || isActiveRoute || isActiveAdminRoute) ? "bg-[#D4AF37] text-white" : "hover:bg-gray-100"}
            `}
          >
            {icon}
            <span className="font-medium">{label}</span>
          </NavLink>
        ) : action ? (
          <button
            onClick={action}
            className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-gray-100 transition-colors"
          >
            {icon}
            <span className="font-medium">{label}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center space-x-3 p-3 w-full rounded-lg transition-colors ${
              isActiveAdminRoute ? "bg-[#D4AF37] text-white" : "hover:bg-gray-100"
            }`}
          >
            {icon}
            <span className="font-medium">{label}</span>
          </button>
        )}
        {subItems && (
          <button onClick={() => setIsOpen(!isOpen)} className="p-2">
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {isOpen && subItems && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-200 pl-1">
          {subItems.map((subItem, index) => (
            <NavItem key={index} {...subItem} userRoles={userRoles} />
          ))}
        </div>
      )}
    </div>
  );
}

