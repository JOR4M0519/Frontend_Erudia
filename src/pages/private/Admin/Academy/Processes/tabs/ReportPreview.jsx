import React, { useState } from "react";
import { Eye, Download } from "lucide-react";
import { motion } from "framer-motion";

const ReportPreview = ({ data, onBack, onConfirm }) => {
  const [viewOption, setViewOption] = useState(null); // "online" o "download"
  
  const handleViewOnline = () => {
    setViewOption("online");
  };
  
  const handleDownload = () => {
    setViewOption("download");
  };
  
  const handleConfirm = () => {
    onConfirm(viewOption);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-100 p-8 rounded-lg"
    >
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">Resumen de boletines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded border border-blue-100">
            <p className="text-sm text-gray-500">Período</p>
            <p className="font-medium">{data?.periodName || "No especificado"}</p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-100">
            <p className="text-sm text-gray-500">Nivel</p>
            <p className="font-medium">{data?.levelName || "No especificado"}</p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-100">
            <p className="text-sm text-gray-500">Grupo</p>
            <p className="font-medium">{data?.groupName || "Todos los grupos"}</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="text-center mb-4">
          <h3 className="text-xl font-medium mb-2">¿Cómo deseas ver los boletines?</h3>
          <p className="text-gray-600">Selecciona una opción para continuar</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          {/* Opción: Ver online */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleViewOnline}
            className={`flex flex-col items-center justify-center p-8 bg-white rounded-lg border-2 transition-all ${
              viewOption === "online" 
                ? "border-amber-500 shadow-lg" 
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Eye size={40} className="text-gray-800" />
            </div>
            <span className="font-medium">Ver online</span>
          </motion.button>
          
          {/* Opción: Descargar */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            className={`flex flex-col items-center justify-center p-8 bg-white rounded-lg border-2 transition-all ${
              viewOption === "download" 
                ? "border-amber-500 shadow-lg" 
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Download size={40} className="text-gray-800" />
            </div>
            <span className="font-medium">Descargar</span>
          </motion.button>
        </div>
        
        <div className="flex space-x-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="py-2 px-8 rounded font-medium bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancelar
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={!viewOption}
            className={`py-2 px-8 rounded font-medium ${
              viewOption 
                ? "bg-amber-500 hover:bg-amber-600 text-white" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Aceptar
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportPreview;
