// AdminConfiguration.jsx
import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreasTab,
  PeriodsTab,
  SchemesTab,
  ObservationsTab,
  LevelsAcademyTab,
  UserStatesTab
} from "./Configuration";

import { AdminRoutes } from "../../../../models";

const AcademicConfiguration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("areas");

  const tabs = [
    { id: "areas", label: "Áreas" },
    { id: "periodo", label: "Periodo" },
    { id: "esquemas", label: "Esquemas" },
    { id: "observaciones", label: "Observaciones" },
    { id: "niveles", label: "Niveles académicos" },
    { id: "estados", label: "Estados de usuario" }
  ];

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(AdminRoutes.ACADEMY)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
              <p className="mt-1 text-sm text-gray-500">Gestione las áreas, periodos, esquemas y otras configuraciones del sistema</p>
            </div>
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
              {activeTab === "areas" && <AreasTab />}
              {activeTab === "periodo" && <PeriodsTab />}
              {activeTab === "esquemas" && <SchemesTab />}
              {activeTab === "observaciones" && <ObservationsTab />}
              {activeTab === "niveles" && <LevelsAcademyTab />}
              {activeTab === "estados" && <UserStatesTab />}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AcademicConfiguration;
