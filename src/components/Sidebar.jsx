import { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import Logout from "./Logout";
import { PrivateRoutes, SideBarRoles } from "../models";
import { decodeRoles,hasAccess } from "../utilities";
import { searchService } from "../windows/Search/searchService";


export default function Sidebar() {
  const userState = useSelector(store => store.user);
  const storedRole = decodeRoles(userState?.roles) ?? [];

  const navItems = [
    { navKey: "DASHBOARD", to: PrivateRoutes.DASHBOARD, icon: <Home className="h-5 w-5" />, label: "Inicio" },
    
    { navKey: "SUBJECTS", to: PrivateRoutes.SUBJECTS, icon: <BookType className="h-5 w-5" />, label: "Materias" },
    { navKey: "ACTIVITIES", to: PrivateRoutes.ACTIVITIES, icon: <NotebookText className="h-5 w-5" />, label: "Actividades" },
    { navKey: "STUDENTTRACKING", to: PrivateRoutes.STUDENTTRACKING, icon: <BookUser className="h-5 w-5" />, label: "Observador" },
    { 
      navKey: "ADMIN",
      to: PrivateRoutes.ADMIN,
      label: "Admin",
      icon: <ShieldPlus className="h-5 w-5" />,
      subItems: [
        { to: "/admin/institucion", label: "Institución", navKey: "ADMIN" },
        { 
          label: "Usuarios", 
          navKey: "ADMIN",
          subItems: [
            { to: "/admin/usuarios/estudiantes", label: "Estudiantes", navKey: "ADMIN" },
            { to: "/admin/usuarios/empleados", label: "Empleados", navKey: "ADMIN" }
          ]
        }
      ]
    },
    { navKey: "GRADES", to: PrivateRoutes.GRADES, icon: <StarIcon className="h-5 w-5" />, label: "Mis Notas" },
    { navKey: "SETTINGS", to: PrivateRoutes.SETTINGS, icon: <Settings className="h-5 w-5" />, label: "Configuraciones" },
  ];

  return (
    <aside
    className={`g-white border-r w-64 h-full flex flex-col shadow-md`}
  >
    {/* 🔹 Contenedor navegación */}
    <div className="flex flex-col flex-1">
      {/* 🔹 Navegación */}
      <nav className="space-y-4 p-1 flex-1 overflow-auto">
        {navItems.map((item, index) =>
          hasAccess(storedRole, SideBarRoles[item.navKey] ?? []) ? (
            <NavItem key={index} {...item} userRoles={storedRole} />
          ) : null
        )}
      </nav>
    </div>

    {/* 🔹 Botón de Logout (SIEMPRE visible) */}
    <div className="p-4 border-t">
      <Logout />
    </div>
  </aside>
  );
}

function NavItem({ to, icon, label, subItems, navKey, userRoles}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!hasAccess(userRoles, SideBarRoles[navKey] ?? [])) return null;

  
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        {to ? (
          <NavLink
            to={to}
            end
            className={({ isActive }) => `
              flex items-center space-x-3 p-3 w-full rounded-lg transition-colors
              ${isActive ? "bg-[#D4AF37] text-white" : "hover:bg-gray-100"}
            `}
          >
            {icon}
            <span className="font-medium">{label}</span>
          </NavLink>
        ) : (
          <button
            
            className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-gray-100 transition-colors"
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
        <div className="ml-6 mt-2 space-y-1">
          {subItems.map((subItem, index) => (
            <NavItem key={index} {...subItem} userRoles={userRoles} />
          ))}
        </div>
      )}
    </div>
  );
}
