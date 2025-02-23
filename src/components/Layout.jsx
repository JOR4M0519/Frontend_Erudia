import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { SearchModal } from "../windows/Search";
import { Roles } from "../models";
import { useSelector } from "react-redux";
import { decodeRoles } from "../utilities";
import StudentTopBar from "../pages/private/Dashboard/StudentTopBar";
import { configViewService } from "../pages/private/Setting";
import {Breadcrumbs} from "./";
export default function Layout({ children }) {

  const userState = useSelector(store => store.user);
  const storedRole = decodeRoles(userState.roles) || [];

  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);

  // 🔹 Suscribirse a los períodos disponibles
  useEffect(() => {
    const periodSubscription = configViewService.getPeriods().subscribe(setPeriods);
    return () => periodSubscription.unsubscribe();
  }, []);

  // 🔹 Suscribirse al período seleccionado
  useEffect(() => {
    const selectedPeriodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
    return () => selectedPeriodSubscription.unsubscribe();
  }, []);

  // 🔹 Cargar períodos al montar el componente
  useEffect(() => {
    configViewService.loadPeriods();
  }, []);
  
  let HeaderComponent = <></>


  if (!storedRole.includes(Roles.STUDENT)) {
    HeaderComponent = (
      <StudentTopBar showSelectorUser={true}/>
    );
  } 
  
  if (storedRole.includes(Roles.STUDENT)) {
    HeaderComponent = (
      <StudentTopBar/>
    );
  }



  return (
    <div className="h-screen grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      {/* 🔹 Header fijo en la parte superior */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between col-span-2 h-18">
        {HeaderComponent}
      </header>

      {/* 🔹 Breadcrumbs debajo del Header */}
      <div className="bg-gray-100 px-6 py-2 col-span-2">
        <Breadcrumbs /> {/* 🔹 Aquí colocamos el breadcrumb en todas las páginas */}
      </div>

      {/* 🔹 Sidebar colocado debajo del header */}
      <aside className="bg-white border-r shadow-md w-64 h-[calc(100vh-64px)] sticky top-16">
        <Sidebar />
      </aside>

      {/* 🔹 Contenido principal con espacio correcto */}
      <main className="p-6 overflow-auto bg-gray-50 h-[calc(100vh-64px)]">
        {children}
      </main>

      {/* 🔹 Modal de búsqueda */}
      <SearchModal />
    </div>
  );
}


// export default function Layout({ header, children }) {
 

//   return (
//     <div className="h-screen grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
//       {/* Header ocupando la primera fila y todo el ancho disponible */}
//       <header className="bg-white shadow-md p-4 flex items-center justify-between col-span-2">
//         {header}
//       </header>

//       {/* Sidebar fijo a la izquierda */}
//       <aside className="bg-white border-r shadow-md w-64 min-h-screen row-span-2 sticky top-0 h-screen">
//         <Sidebar />
//       </aside>

//       {/* Contenido principal en la segunda fila, expandiéndose */}
//       <main className="p-6 overflow-auto bg-gray-50">
//         {children}
//       </main>

//       {/* Modal de búsqueda */}
//       <SearchModal />
//     </div>
//   );
// }
