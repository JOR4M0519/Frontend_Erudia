import React, { useState } from "react";
import { FilePlus, Download, FileText, Search, Filter, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { ReportForm, ReportPreview } from "../";
import { processesService } from "../";

const GenerateReportsTab = () => {
  const [activeStep, setActiveStep] = useState("form"); // form, preview, success
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = (data) => {
    setLoading(true);
    
    // Simular una llamada API para generar el reporte
    setTimeout(() => {
      setReportData(data);
      setActiveStep("preview");
      setLoading(false);
    }, 1000);
  };

  const handleGenerateReport = (viewOption) => {
    setLoading(true);
    
    // Simular una llamada API para finalizar la generación
    setTimeout(() => {
      setActiveStep("success");
      setLoading(false);
      
      // Acción dependiendo de la opción seleccionada
      if (viewOption === "download") {
        console.log("Descargando boletines...");
      } else {
        console.log("Visualizando boletines online...");
      }
    }, 1500);
  };

  const handleReset = () => {
    setActiveStep("form");
    setReportData(null);
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Pasos del proceso */}
      <div className="mb-6 border-b pb-4">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <div className={`flex-1 text-center ${activeStep === "form" ? "text-amber-500" : "text-gray-500"}`}>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${activeStep === "form" ? "bg-amber-500 text-white" : "bg-gray-200"}`}>
              <FilePlus size={16} />
            </div>
            <p className="mt-1 text-sm">Configurar</p>
          </div>
          <div className="w-24 h-0.5 bg-gray-200"></div>
          <div className={`flex-1 text-center ${activeStep === "preview" ? "text-amber-500" : "text-gray-500"}`}>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${activeStep === "preview" ? "bg-amber-500 text-white" : "bg-gray-200"}`}>
              <FileText size={16} />
            </div>
            <p className="mt-1 text-sm">Vista previa</p>
          </div>
          <div className="w-24 h-0.5 bg-gray-200"></div>
          <div className={`flex-1 text-center ${activeStep === "success" ? "text-amber-500" : "text-gray-500"}`}>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${activeStep === "success" ? "bg-amber-500 text-white" : "bg-gray-200"}`}>
              <Download size={16} />
            </div>
            <p className="mt-1 text-sm">Descargar</p>
          </div>
        </div>
      </div>

      {/* Contenido según el paso actual */}
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        {activeStep === "form" && (
          <ReportForm onSubmit={handleFormSubmit} loading={loading} />
        )}

        {activeStep === "preview" && (
          <ReportPreview 
            data={reportData} 
            onBack={handleReset}
            onConfirm={handleGenerateReport}
          />
        )}

        {activeStep === "success" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-10"
          >
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Download size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡Boletines generados correctamente!</h3>
            <p className="text-gray-500 mb-6">Los archivos están listos para ser descargados</p>
            
            <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">boletines_periodo1_2025.zip</span>
                <span className="text-gray-500 text-sm">12.4 MB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-full"></div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Generar otros boletines
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2 bg-amber-500 text-white rounded-md flex items-center hover:bg-amber-600"
              >
                <Download size={16} className="mr-2" />
                Descargar todos
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GenerateReportsTab;
