import { useState } from "react";
import { ChevronLeft, FileBarChart, RefreshCw, FileText, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SubjectsByDimension from "./Reports/SubjectsByDimension";
import RecoveryReports from "./Reports/RecoveryReports";
import { AdminRoutes } from "../../../../models";

const AcademicReports = () => {
  const [activeTab, setActiveTab] = useState("subjects");
  const navigate = useNavigate();

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(AdminRoutes.ACADEMY)}
                className="mr-4 p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reportes Académicos</h1>
                <p className="mt-1 text-sm text-gray-500">Visualiza y genera reportes académicos para todas las materias</p>
              </div>
            </div>
            <div className="hidden md:block">
              <FileBarChart className="h-12 w-12 text-blue-500 opacity-80" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-start items-center sm:items-start">
            <button
              className={`rounded-lg px-6 py-3 font-medium flex items-center gap-2 transition-all duration-200 min-w-[200px] justify-center ${
                activeTab === "subjects"
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("subjects")}
            >
              <FileText className="h-5 w-5" />
              <span>Por materia</span>
            </button>
            <button
              className={`rounded-lg px-6 py-3 font-medium flex items-center gap-2 transition-all duration-200 min-w-[200px] justify-center ${
                activeTab === "recovery"
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("recovery")}
            >
              <RefreshCw className="h-5 w-5" />
              <span>Recuperaciones</span>
            </button>
          </div>
        </div>

        <div className="relative min-h-[calc(100vh-400px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-white rounded-xl shadow-sm p-6"
            >
              {activeTab === "subjects" ? <SubjectsByDimension /> : <RecoveryReports />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer className="mt-auto bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Sistema de Reportes Académicos
            </p>
            <BarChart2 className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </footer>
    </main>
  );
};

export default AcademicReports;
