import React from "react";
import { User, BookOpen, Palette, PenTool } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AdminSystem = () => {
  const navigate = useNavigate();
  
  const cards = [
    {
      title: "Usuario",
      description: "Gestiona los usuarios y permisos del sistema",
      icon: <User className="h-12 w-12 text-blue-600" />,
      path: "/admin/sistema/usuario",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100"
    },
    {
      title: "Registro",
      description: "Administra los registros y bitácoras del sistema",
      icon: <BookOpen className="h-12 w-12 text-indigo-600" />,
      path: "/admin/sistema/registro",
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100"
    },
    {
      title: "Mantenimiento",
      description: "Configura opciones de mantenimiento y respaldo",
      icon: <PenTool className="h-12 w-12 text-gray-600" />,
      path: "/admin/sistema/mantenimiento",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-200"
    },
    {
      title: "Apariencias",
      description: "Personaliza la apariencia visual del sistema",
      icon: <Palette className="h-12 w-12 text-purple-600" />,
      path: "/admin/sistema/apariencias",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100"
    }
  ];

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administración del Sistema</h1>
            <p className="mt-1 text-sm text-gray-500">Gestiona todos los aspectos técnicos y configuraciones del sistema</p>
          </div>
          <PenTool className="h-12 w-12 text-primary" />
        </div>
      </header>
      
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`${card.bgColor} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              onClick={() => navigate(card.path)}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                <p className="text-gray-600">{card.description}</p>
              </div>
              <div className="px-6 py-2 bg-white/50 border-t border-gray-100">
                <div className="flex justify-end">
                  <span className="inline-flex items-center text-sm font-medium text-primary">
                    Ver más
                    <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

export default AdminSystem;
