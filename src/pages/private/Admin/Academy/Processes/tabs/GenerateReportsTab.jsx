import React, { useState, useEffect } from "react";
import { FilePlus, Download, FileText, Search, Filter, ChevronDown, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { ReportForm, ReportPreview, ReportModal } from "../";
import { processesService } from "../processesService";
import Swal from "sweetalert2"; // Importamos SweetAlert2

const GenerateReportsTab = () => {
  const [activeStep, setActiveStep] = useState("form"); // form, preview, success
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // Para almacenar el resultado de la operación
  const [selectedStudents, setSelectedStudents] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [reportUrl, setReportUrl] = useState(null); // Para almacenar la URL del reporte
  const [isModalOpen, setIsModalOpen] = useState(false); // Para controlar la apertura/cierre del modal

  // Limpiar las URLs de blob cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (reportUrl && result?.isBlob) {
        URL.revokeObjectURL(reportUrl);
      }
    };
  }, [reportUrl, result]);

  const handleFormSubmit = (data) => {
    setLoading(true);
    
    // Ya no simulamos, simplemente pasamos a la vista previa
    setReportData(data);
    setActiveStep("preview");
    setLoading(false);
  };

  const handleGenerateReport = async (viewOption) => {
    // Mostrar SweetAlert para indicar la carga
  };
  

  const handleReportDownload = async() => {
    let response;
    
    // Si hay estudiantes seleccionados específicamente y no es solo uno
    if (reportData.selectedStudents && reportData.selectedStudents.length > 1) {
      // Usar el endpoint para múltiples estudiantes seleccionados
      response = await processesService.downloadSelectedStudentsReport(
        reportData.selectedGroup, 
        reportData.period,
        reportData.selectedStudents
      );
    }
    // Si es un solo estudiante
    else if (reportData.selectedStudents && reportData.selectedStudents.length === 1) {
      response = await processesService.downloadStudentReport(
        reportData.selectedStudents[0], 
        reportData.selectedGroup, 
        reportData.period
      );
    }
    // Si es todo el grupo (sin selección específica)
    else {
      response = await processesService.downloadGroupReport(
        reportData.selectedGroup, 
        reportData.period
      );
    }
    
    return response;
  };

  const handleReset = () => {
    // Limpiar la URL de blob si existe
    if (reportUrl && result?.isBlob) {
      URL.revokeObjectURL(reportUrl);
    }
    
    setActiveStep("form");
    setReportData(null);
    setResult(null);
    setReportUrl(null);
  };

  // Función para abrir el modal del reporte
  const openReportModal = () => {
    setIsModalOpen(true);
  };

  // Función para cerrar el modal del reporte
  const closeReportModal = () => {
    setIsModalOpen(false);
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
            <div className={`w-16 h-16 mx-auto ${result?.success ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mb-4`}>
              {result?.viewOption === "download" ? (
                <Download size={32} className={result?.success ? "text-green-600" : "text-red-600"} />
              ) : (
                <Eye size={32} className={result?.success ? "text-green-600" : "text-red-600"} />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {result?.success 
                ? result?.viewOption === "download" 
                  ? "¡Boletines generados correctamente!" 
                  : "¡Reporte listo para visualizar!"
                : "Error al generar boletines"}
            </h3>
            <p className="text-gray-500 mb-6">{result?.message || "Operación completada"}</p>
            
            {result?.success && (
              <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Reporte académico</span>
                  <span className="text-gray-500 text-sm">Completado</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full"></div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Generar otros boletines
              </motion.button>
              
              {result?.success && result?.viewOption === "download" && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-2 bg-amber-500 text-white rounded-md flex items-center hover:bg-amber-600"
                  onClick={() => {
                    handleReportDownload(); 
                  }}
                >
                  <Download size={16} className="mr-2" />
                  Descargar de nuevo
                </motion.button>
              )}
              
              {/* Botón para ver el reporte en el modal */}
              {result?.success && result?.viewOption === "view" && reportUrl && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-2 bg-amber-500 text-white rounded-md flex items-center hover:bg-amber-600"
                  onClick={openReportModal}
                >
                  <Eye size={16} className="mr-2" />
                  Ver reporte
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Modal para visualizar el reporte */}
      <ReportModal 
        url={reportUrl} 
        isOpen={isModalOpen} 
        onClose={closeReportModal}
        isZip={result?.isZip}
      />
    </div>
  );
};

export default GenerateReportsTab;