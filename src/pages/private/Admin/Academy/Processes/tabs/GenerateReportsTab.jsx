import React, { useState } from "react";
import { FilePlus, Download, FileText, Search, Filter, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { ReportForm, ReportPreview } from "../";
import { processesService } from "../processesService";

const GenerateReportsTab = () => {
  const [activeStep, setActiveStep] = useState("form"); // form, preview, success
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // Para almacenar el resultado de la operación

  const handleFormSubmit = (data) => {
    setLoading(true);
    
    // Ya no simulamos, simplemente pasamos a la vista previa
    setReportData(data);
    setActiveStep("preview");
    setLoading(false);
  };

  const handleGenerateReport = async (viewOption) => {
    setLoading(true);
    
    let response;
    const data = reportData;
    
    try {
      // Guardar la opción de visualización para referencia futura
      const viewTypeSelected = viewOption;
      console.log(data)
      // Realizar la acción según la opción seleccionada
      if (viewOption === "download") {
        const selectedStudents = data.selectedStudents > 0 ? data.selectedStudents: undefined 

        // Si es un grupo específico
        if (selectedStudents==undefined && data.selectedGroup) {
          response = await processesService.downloadGroupReport(data.selectedGroup, data.period);
        } 
        
        // Si es un estudiante específco
        else if (selectedStudents) {
          response = await processesService.downloadStudentReport(
            selectedStudents[0], 
            data.selectedGroup, 
            data.period
          );
          
        }
      } else {
        // Ver online
        const selectedStudents = data.selectedStudents > 0 ? data.selectedStudents: undefined 
        const id = selectedStudents || data.selectedGroup;
        const type = data.studentId ? "student" : "group";
        response = await processesService.viewReportOnline(id, data.period, type);
      }
      console.log(response)
      // Asegurar que el resultado tiene la propiedad viewOption
      if (response.success && !response.viewOption) {
        response.viewOption = viewTypeSelected;
      }
      
      setResult(response);
      setActiveStep("success");
    } catch (error) {
      console.error("Error generando reporte:", error);
      setResult({ 
        success: false, 
        message: "Error al generar el reporte: " + (error.message || "Error desconocido") 
      });
      setActiveStep("success");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep("form");
    setReportData(null);
    setResult(null);
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
              <Download size={32} className={result?.success ? "text-green-600" : "text-red-600"} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {result?.success 
                ? "¡Boletines generados correctamente!" 
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
                    // Para descarga, repetimos la acción
                    if (reportData.studentId) {
                      processesService.downloadStudentReport(
                        reportData.studentId, 
                        reportData.groupId, 
                        reportData.periodId
                      );
                    } else {
                      processesService.downloadGroupReport(
                        reportData.groupId, 
                        reportData.periodId
                      );
                    }
                  }}
                >
                  <Download size={16} className="mr-2" />
                  Descargar de nuevo
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GenerateReportsTab;