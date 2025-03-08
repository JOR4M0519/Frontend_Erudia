import { FileText, Settings, Activity, Calendar, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AdminRoutes } from "../../../../models";

const AdminAcademy = () => {
  const navigate = useNavigate();
  
  const cards = [
    {
      title: "Reportes",
      description: "Genera e imprime reportes académicos y boletines",
      icon: <FileText className="h-12 w-12 text-yellow-600" />,
      path: AdminRoutes.ACADEMY_REPORTS,
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100"
    },
    {
      title: "Configuración",
      description: "Configura períodos, escalas de evaluación y parámetros académicos",
      icon: <Settings className="h-12 w-12 text-blue-600" />,
      path: AdminRoutes.ACADEMY_CONFIG,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100"
    },
    {
      title: "Procesos",
      description: "Gestiona procesos académicos, cierre de períodos y promoción",
      icon: <Activity className="h-12 w-12 text-green-600" />,
      path: AdminRoutes.ACADEMY_PROCESSES,
      bgColor: "bg-gradient-to-br from-green-50 to-green-100"
    },
    /*{
      title: "Horario académico",
      description: "Crea y administra horarios de clases y actividades",
      icon: <Calendar className="h-12 w-12 text-purple-600" />,
      path: AdminRoutes.ACADEMY_SCHEDULE,
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100"
    }*/
  ];

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administración Académica</h1>
            <p className="mt-1 text-sm text-gray-500">Gestiona todos los procesos académicos de la institución</p>
          </div>
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
      </header>
      
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`${card.bgColor} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col`}
              onClick={() => navigate(card.path)}
            >
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                <p className="text-gray-600 text-sm flex-grow">{card.description}</p>
              </div>
              <div className="px-6 py-2 bg-white/50 border-t border-gray-100 mt-auto">
                <div className="flex justify-end">
                  <span className="inline-flex items-center text-sm font-medium text-primary">
                    Ver más
                    <svg 
                      className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Sistema de Gestión Educativa
            </div>
            <div className="mt-2 md:mt-0 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-700">Ayuda</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Términos</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default AdminAcademy;
