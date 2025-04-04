import React, { useState } from "react";
import { ChevronLeft, Users, ClipboardList, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PromotionsTab,
  StatusTab,
  AbsencesProcessTab,
  ManagementTab
} from "./Processes";
import { AdminRoutes } from "../../../../models";

const AdminStudentProcesses = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("promociones");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const tabs = [
    { id: "promociones", label: "Promociones" },
    { id: "estado", label: "Estado" },
    // { id: "ausencias", label: "Ausencias" },
    { id: "gestion", label: "Gestión" }
  ];

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(AdminRoutes.STUDENTS)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Procesos de Estudiantes</h1>
              <p className="mt-1 text-sm text-gray-500">Gestión de cambios de estado, promociones y ausencias de estudiantes</p>
            </div>
            {/* <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <select 
                className="form-select rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-primary focus:border-primary"
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div> */}
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-wrap text-sm font-medium text-center border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 p-4 transition-colors ${
                  activeTab === tab.id
                    ? "bg-gray-100 text-primary border-b-2 border-primary"
                    : "hover:bg-gray-50 text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "promociones" && <PromotionsTab year={currentYear} />}
              {activeTab === "estado" && <StatusTab year={currentYear} />}
              {activeTab === "ausencias" && <AbsencesProcessTab year={currentYear} />}
              {activeTab === "gestion" && <ManagementTab year={currentYear} />}
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Sistema de Gestión Educativa
            </div>
            <div className="mt-2 md:mt-0 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-700">Ayuda</a>
              <a href="#" className="text-gray-500 hover:text-gray-700">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default AdminStudentProcesses;
