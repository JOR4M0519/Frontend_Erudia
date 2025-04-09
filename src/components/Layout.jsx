import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { SearchModal } from "../windows/Search";
import { Roles } from "../models";
import { useSelector } from "react-redux";
import { decodeRoles } from "../utilities";
import {UserTopBar} from "../pages/private/Dashboard";
import { configViewService } from "../pages/private/Setting";
import {Breadcrumbs} from "./";

export default function Layout({ children }) {
  const userState = useSelector(store => store.user);
  const storedRole = decodeRoles(userState.roles) || [];

  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) setSidebarOpen(true);
      if (mobile && sidebarOpen) setSidebarOpen(false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Suscribirse a los períodos disponibles y al período seleccionado (sin cambios)
  useEffect(() => {
    const periodSubscription = configViewService.getPeriods().subscribe(setPeriods);
    return () => periodSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    const selectedPeriodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
    return () => selectedPeriodSubscription.unsubscribe();
  }, []);

  useEffect(() => {
    configViewService.loadPeriods();
  }, []);
  
  let HeaderComponent = <></>;

  if (!storedRole.includes(Roles.STUDENT)) {
    HeaderComponent = (
      <UserTopBar showSelectorUser={true}/>
    );
  } 
  
  if (storedRole.includes(Roles.STUDENT)) {
    HeaderComponent = (
      <UserTopBar/>
    );
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Header fijo en la parte superior */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between w-full z-30">
        {HeaderComponent}
      </header>

      {/* Breadcrumbs con mejor visibilidad */}
      <div className="bg-white shadow-sm px-6 py-3 w-full z-20 border-b border-gray-200 sticky top-16">
        <div className="flex items-center">
          {isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="mr-3 p-2 rounded-md hover:bg-gray-100 text-gray-600"
            >
              ☰
            </button>
          )}
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar con ajustes para mejor visualización */}
        <aside 
          className={`bg-white transition-all duration-300 ease-in-out ${
            sidebarOpen ? (isMobile ? 'w-56' : 'w-64') : 'w-0'
          } ${
            isMobile 
              ? 'absolute z-40 h-[calc(100%-6rem)] top-[6rem] left-0 shadow-xl' 
              : 'relative'
          } overflow-hidden`}
        >
          {sidebarOpen && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <Sidebar />
              </div>
            </div>
          )}
        </aside>

        {/* Overlay para cerrar sidebar en móvil */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 backdrop-blur-xs bg-opacity-30 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main className={`flex-1 p-6 overflow-auto bg-gray-50 ${isMobile && sidebarOpen ? 'opacity-100' : 'opacity-100'}`}>
          {children}
        </main>
      </div>

      {/* Modal de búsqueda */}
      <SearchModal />
    </div>
  );
}
